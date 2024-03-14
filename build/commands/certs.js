"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
class CertsCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'certs',
            description: 'Próximas evaluaciones.',
            groupOnly: true,
        });
    }
    async run(context) {
        context;
    }
}
exports.default = CertsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxnQ0FBaUU7QUFFakUsTUFBcUIsWUFBYSxTQUFRLGFBQVc7SUFJakQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QjtRQUNwQyxPQUFPLENBQUM7SUFDWixDQUFDO0NBQ0o7QUFmRCwrQkFlQyJ9