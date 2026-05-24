export const TicketSalesContract = {
    "address": "0x286b1535d62dd993866499e3c9cd2177d7d09cfd",
    "abi": [
        {
          "type": "constructor",
          "inputs": [
            {
              "name": "initialRecipient",
              "type": "address",
              "internalType": "address"
            }
          ],
          "stateMutability": "nonpayable"
        },
        {
          "type": "function",
          "name": "buyTicket",
          "inputs": [],
          "outputs": [],
          "stateMutability": "payable"
        },
        {
          "type": "function",
          "name": "owner",
          "inputs": [],
          "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "paymentRecipient",
          "inputs": [],
          "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "purchases",
          "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
          "outputs": [
            { "name": "hasPurchased", "type": "bool", "internalType": "bool" },
            {
              "name": "purchaseTimestamp",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "purchaseAmount",
              "type": "uint256",
              "internalType": "uint256"
            }
          ],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "setPaymentRecipient",
          "inputs": [
            { "name": "newRecipient", "type": "address", "internalType": "address" }
          ],
          "outputs": [],
          "stateMutability": "nonpayable"
        },
        {
          "type": "function",
          "name": "setTicketPrice",
          "inputs": [
            { "name": "newPrice", "type": "uint256", "internalType": "uint256" }
          ],
          "outputs": [],
          "stateMutability": "nonpayable"
        },
        {
          "type": "function",
          "name": "ticketPrice",
          "inputs": [],
          "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "totalTicketsSold",
          "inputs": [],
          "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "transferOwnership",
          "inputs": [
            { "name": "newOwner", "type": "address", "internalType": "address" }
          ],
          "outputs": [],
          "stateMutability": "nonpayable"
        },
        {
          "type": "function",
          "name": "withdrawERC20",
          "inputs": [
            { "name": "token", "type": "address", "internalType": "address" },
            { "name": "to", "type": "address", "internalType": "address" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" }
          ],
          "outputs": [],
          "stateMutability": "nonpayable"
        },
        {
          "type": "function",
          "name": "withdrawEther",
          "inputs": [
            { "name": "to", "type": "address", "internalType": "address payable" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" }
          ],
          "outputs": [],
          "stateMutability": "nonpayable"
        },
        {
          "type": "event",
          "name": "OwnerUpdated",
          "inputs": [
            {
              "name": "oldOwner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
            },
            {
              "name": "newOwner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
            }
          ],
          "anonymous": false
        },
        {
          "type": "event",
          "name": "PaymentRecipientUpdated",
          "inputs": [
            {
              "name": "oldRecipient",
              "type": "address",
              "indexed": true,
              "internalType": "address"
            },
            {
              "name": "newRecipient",
              "type": "address",
              "indexed": true,
              "internalType": "address"
            }
          ],
          "anonymous": false
        },
        {
          "type": "event",
          "name": "TicketPriceUpdated",
          "inputs": [
            {
              "name": "oldPrice",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
            },
            {
              "name": "newPrice",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
            }
          ],
          "anonymous": false
        },
        {
          "type": "event",
          "name": "TicketPurchased",
          "inputs": [
            {
              "name": "buyer",
              "type": "address",
              "indexed": true,
              "internalType": "address"
            },
            {
              "name": "amount",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
            },
            {
              "name": "paid",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
            },
            {
              "name": "timestamp",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
            }
          ],
          "anonymous": false
        },
        { "type": "error", "name": "AlreadyPurchased", "inputs": [] },
        { "type": "error", "name": "InvalidAddress", "inputs": [] },
        { "type": "error", "name": "InvalidAmount", "inputs": [] },
        { "type": "error", "name": "InvalidRecipient", "inputs": [] },
        { "type": "error", "name": "InvalidTicketPrice", "inputs": [] },
        { "type": "error", "name": "NotOwner", "inputs": [] },
        { "type": "error", "name": "TransferFailed", "inputs": [] }
      ]
} as const;