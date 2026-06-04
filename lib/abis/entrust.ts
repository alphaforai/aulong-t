const entrustAddress = process.env
  .NEXT_PUBLIC_ENTRUST_CONTRACT_ADDRESS as `0x${string}`;

export const entrustContract = {
    address: entrustAddress,
    "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_vUSDTReceiver",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_ticketSales",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        { "inputs": [], "type": "error", "name": "CannotRemoveOwnerOperator" },
        { "inputs": [], "type": "error", "name": "InvalidAddress" },
        { "inputs": [], "type": "error", "name": "InvalidAmount" },
        { "inputs": [], "type": "error", "name": "InvalidPeriod" },
        { "inputs": [], "type": "error", "name": "NotOperator" },
        { "inputs": [], "type": "error", "name": "NotOwner" },
        { "inputs": [], "type": "error", "name": "RecordAlreadyUndone" },
        { "inputs": [], "type": "error", "name": "RecordNotFound" },
        { "inputs": [], "type": "error", "name": "RecordNotOwned" },
        { "inputs": [], "type": "error", "name": "TicketNotPurchased" },
        { "inputs": [], "type": "error", "name": "TransferFailed" },
        {
          "inputs": [
            { "internalType": "string", "name": "action", "type": "string" },
            {
              "internalType": "uint256",
              "name": "errorCode",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "VenusCallFailed"
        },
        { "inputs": [], "type": "error", "name": "ZeroAmount" },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "recordId",
              "type": "uint256",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256",
              "indexed": false
            },
            {
              "internalType": "uint256",
              "name": "periodDays",
              "type": "uint256",
              "indexed": false
            },
            {
              "internalType": "uint256",
              "name": "vUsdtMinted",
              "type": "uint256",
              "indexed": false
            },
            {
              "internalType": "uint256",
              "name": "unlockAt",
              "type": "uint256",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "EntrustDeposited",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "recordId",
              "type": "uint256",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "operator",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "EntrustUndone",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "oldAmount",
              "type": "uint256",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "newAmount",
              "type": "uint256",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "MinEntrustAmountUpdated",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "OperatorUpdated",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "oldOwner",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "OwnerUpdated",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "periodDays",
              "type": "uint256",
              "indexed": true
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "SupportedPeriodUpdated",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "oldReceiver",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "newReceiver",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "VUSDTReceiverUpdated",
          "anonymous": false
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "USDT",
          "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "V_USDT",
          "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
          ]
        },
        {
          "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "entrustRecords",
          "outputs": [
            { "internalType": "address", "name": "user", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            {
              "internalType": "uint256",
              "name": "periodDays",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "vUsdtMinted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "depositedAt",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "unlockAt",
              "type": "uint256"
            },
            { "internalType": "bool", "name": "undone", "type": "bool" }
          ]
        },
        {
          "inputs": [
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            {
              "internalType": "uint256",
              "name": "periodDays",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "entrustUSDT"
        },
        {
          "inputs": [
            { "internalType": "address", "name": "user", "type": "address" }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getUserEntrustRecords",
          "outputs": [
            {
              "internalType": "struct EntrustTest.EntrustRecord[]",
              "name": "",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "periodDays",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "vUsdtMinted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "depositedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "unlockAt",
                  "type": "uint256"
                },
                { "internalType": "bool", "name": "undone", "type": "bool" }
              ]
            }
          ]
        },
        {
          "inputs": [
            { "internalType": "address", "name": "user", "type": "address" }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getUserRecordCount",
          "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
          ]
        },
        {
          "inputs": [
            { "internalType": "address", "name": "user", "type": "address" }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getUserRecordIds",
          "outputs": [
            { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "minEntrustAmount",
          "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "nextRecordId",
          "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
          ]
        },
        {
          "inputs": [
            { "internalType": "address", "name": "", "type": "address" }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "operators",
          "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "owner",
          "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "newMinEntrustAmount",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "setMinEntrustAmount"
        },
        {
          "inputs": [
            { "internalType": "address", "name": "account", "type": "address" },
            { "internalType": "bool", "name": "enabled", "type": "bool" }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "setOperator"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "periodDays",
              "type": "uint256"
            },
            { "internalType": "bool", "name": "enabled", "type": "bool" }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "setSupportedPeriod"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newReceiver",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "setVUSDTReceiver"
        },
        {
          "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "supportedPeriods",
          "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "ticketSales",
          "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
          ]
        },
        {
          "inputs": [
            { "internalType": "address", "name": "newOwner", "type": "address" }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "transferOwnership"
        },
        {
          "inputs": [
            { "internalType": "address", "name": "user", "type": "address" },
            { "internalType": "uint256", "name": "recordId", "type": "uint256" }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "undoEntrustUSDT"
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "vUSDTReceiver",
          "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
          ]
        },
        {
          "inputs": [
            { "internalType": "address", "name": "token", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "withdrawERC20"
        },
        {
          "inputs": [
            {
              "internalType": "address payable",
              "name": "to",
              "type": "address"
            },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "withdrawEther"
        },
        { "inputs": [], "stateMutability": "payable", "type": "receive" }
      ]
} as const;