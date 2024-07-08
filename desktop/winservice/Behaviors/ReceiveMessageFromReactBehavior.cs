﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp.Server;
using WebSocketSharp;
using DATSCompanion.Shared.Models;
using System.IO;
using System.Text.Json;
using DATSCompanionService.Interfaces;
using System.Net.Http;
using System.IO.Compression;
using System.Security.Cryptography;

namespace DATSCompanionService.Behaviors
{
    public class ReceiveMessageFromReactBehavior : WebSocketBehavior
    {

        public EventLog Logger { get; set; }

        public IBroadcastService Broadcast { get; set; }

        protected override void OnOpen()
        {
            base.OnOpen();
            Logger?.WriteEntry("React app connected");
        }

        protected override void OnClose(CloseEventArgs e)
        {
            base.OnClose(e);
            Logger?.WriteEntry("React app DISconnected");
        }

        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            base.OnError(e);
            Logger?.WriteEntry($"React app error {e.Message}");
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            Logger?.WriteEntry($"payload received {e.Data}");
            var messageJson = e.Data;
            var message = System.Text.Json.JsonSerializer.Deserialize<MessageContract<dynamic>>(messageJson);
            switch (message.Action)
            {
                case DATSActions.FolderUpload:
                    UploadFolder(message);
                    break;
                case DATSActions.CheckFolder:
                    CheckIfFileFolderExist(message);
                    break;
            }
        }

        private void CheckIfFileFolderExist(MessageContract<dynamic> message)
        {
            Logger?.WriteEntry("Checking if folder exists");
            var payload = JsonSerializer.Deserialize<DATSFileToUpload>(message.Payload);
            foreach (var path in payload.Paths)
            {
                Logger?.WriteEntry($"{path} verified");
                Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                {
                    Action = System.IO.Directory.Exists(path) ? DATSActions.FileFolderExists : DATSActions.FileFolderNotExists,
                    Source = DATSSource.Service,
                    Payload = new ReportProgress
                    {
                        Progress = 100,
                        Message = path
                    }
                }));
            }
        }

        private void UploadFolder(dynamic message)
        {
            var tempPath = GetTemporaryDirectory();
            var payload = JsonSerializer.Deserialize<DATSFileToUpload>(message.Payload);
            for(int i = 0; i <  payload.Paths.Length; i++) 
            //foreach (var path in payload.Paths)
            {
                var path = payload.Paths[i];
                Logger?.WriteEntry($"uploading folder {path}");
                try
                {
                    var uploadFileDetails = message.Payload;

                    string zipFileName = $"{Path.GetFileName(path)}.zip";
                    string zipPath = Path.Combine(tempPath, zipFileName);

                    // Zip the folder
                    if (File.Exists(zipPath))
                    {
                        File.Delete(zipPath);
                    }
                    ZipFile.CreateFromDirectory(path, zipPath);
                    Logger?.WriteEntry($"archived file for folder {zipPath}");
                    // Calculate SHA-1 checksum
                    string checksum = CalculateSHA1(zipPath);

                    // Upload the zip file and checksum
                    using (var client = new HttpClient())
                    {
                        var content = new MultipartFormDataContent();
                        // Read the file bytes
                        var fileContent = new ByteArrayContent(File.ReadAllBytes(zipPath));
                        fileContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("application/octet-stream");
                        fileContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data")
                        {
                            Name = "file",
                            FileName = Path.GetFileName(zipPath)
                        };

                        // Add the file content to the multipart content
                        content.Add(fileContent);

                        // Add additional fields to the multipart content
                        content.Add(new StringContent(checksum), "checksum");
                        content.Add(new StringContent(payload.TransferId), "transferId");

                        // Post the content to the server
                        var result = client.PostAsync(payload.UploadUrl, content).Result;
                        if (result.IsSuccessStatusCode)
                        {
                            Logger?.WriteEntry($"folder upload successful {path}");
                            Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                            {
                                Action = DATSActions.Progress,
                                Source = DATSSource.Service,
                                Payload = new ReportProgress
                                {
                                    Progress = 100.0 * i / payload.Paths.Length,
                                    Message = $"{path}"
                                }
                            }));
                        }
                        else
                        {
                            Logger?.WriteEntry($"folder upload failed {path}; reason {result.StatusCode}");

                            Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<Error>
                            {
                                Action = DATSActions.Error,
                                Source = DATSSource.Service,
                                Payload = new Error
                                {
                                    Message = $"{path}"
                                }
                            }));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Logger?.WriteEntry($"folder upload failed {path}; reason {ex.Message} {ex.StackTrace}");

                    Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<Error>
                    {
                        Action = DATSActions.Error,
                        Source = DATSSource.Service,
                        Payload = new Error
                        {
                            Message = $"{path}"
                        }
                    }));
                }
            }
            Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<ReportProgress>
            {
                Action = DATSActions.Completed,
                Source = DATSSource.Service,
                Payload = new ReportProgress
                {
                    Progress = 100
                }
            }));
        }
        private string CalculateSHA1(string filePath)
        {
            using (var sha1 = SHA1.Create())
            {
                using (var stream = File.OpenRead(filePath))
                {
                    var hash = sha1.ComputeHash(stream);
                    return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
                }
            }
        }

        private string GetTemporaryDirectory()
        {
            string tempDirectory = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());

            if (File.Exists(tempDirectory))
            {
                return GetTemporaryDirectory();
            }
            else
            {
                Directory.CreateDirectory(tempDirectory);
                return tempDirectory;
            }
        }
    }
}