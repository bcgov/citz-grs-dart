﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionApp
{
    public interface IServiceCommunicator
    {
        void PostMessage(string message);
    }
}
