using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace FunctionApp
{
    public class Message
    {
        public string Sender { get; set; }
        public string Sid { get; set; }
        public object Data { get; set; }
    }

    public static class Functions
    {
        private static readonly ConcurrentDictionary<string, HashSet<string>> _groups = new ConcurrentDictionary<string, HashSet<string>>();

        static Functions()
        {
            JsonConvert.DefaultSettings = () => new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
        }

        [FunctionName("negotiate")]
        public static SignalRConnectionInfo GetSignalRInfo(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req,
            [SignalRConnectionInfo(HubName = "chat", UserId = "{headers.x-uid}")] SignalRConnectionInfo connectionInfo)
        {
            return connectionInfo;
        }

        [FunctionName("messages")]
        public static Task SendMessage(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] Message msg,
            [SignalR(HubName = "chat")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            return signalRMessages.AddAsync( new SignalRMessage { Target = "msg", GroupName = msg.Sid, Arguments = new[] { msg } } );
        }

        [FunctionName("join")]
        public static async Task<HashSet<string>> Join(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] Message msg,
            [SignalR(HubName = "chat")] IAsyncCollector<SignalRGroupAction> signalRGroupActions,
            [SignalR(HubName = "chat")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            var userId = AddToGroup(msg.Sender, msg.Sid);

            await signalRGroupActions.AddAsync( new SignalRGroupAction { UserId = userId, GroupName = msg.Sid, Action = GroupAction.Add } );

            var toss = _groups[msg.Sid].ElementAt(new Random().Next(_groups[msg.Sid].Count));
            await signalRMessages.AddAsync( new SignalRMessage { Target = "join", GroupName = msg.Sid, Arguments = new[] { new { toss } } } );

            return _groups[msg.Sid];
        }

        [FunctionName("leave")]
        public static async Task Leave(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] Message msg,
            [SignalR(HubName = "chat")] IAsyncCollector<SignalRGroupAction> signalRGroupActions,
            [SignalR(HubName = "chat")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            var userId = RemoveFromGroup(msg.Sender, msg.Sid);

            await signalRGroupActions.AddAsync( new SignalRGroupAction { UserId = userId, GroupName = msg.Sid, Action = GroupAction.Remove } );
            await signalRMessages.AddAsync( new SignalRMessage { Target = "leave", GroupName = msg.Sid, Arguments = new[] { msg } } );
        }

        private static string AddToGroup(string user, string group)
        {
            if (!_groups.ContainsKey(group))
                _groups.AddOrUpdate(group, new HashSet<string>(), (key, set) => new HashSet<string>());

            var uid = Uid(user, group);

            _groups[group].Add(uid);

            return uid;
        }

        private static string RemoveFromGroup(string user, string group)
        {
            var uid = Uid(user, group);

            if (_groups.ContainsKey(group))
                _groups[group].Remove(uid);

            return uid;
        }

        private static string Uid(string user, string group)
        {
            return $"{group}-{user}";
        }
    }
}
