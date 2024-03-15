"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
let subjectInfoTab;
const subjectInfoQuerySelector = '#node-25 > div > div > div > div:nth-child(1)';
const args = [{
        key: 'codigo',
        prompt: 'Código del ramo.',
        type: lib_1.ArgumentType.Number,
        min: 0,
        required: true,
    }];
class AddRamoCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'addramo',
            description: 'Añadir un ramo.',
            groupOnly: true,
            args,
        });
    }
    async run(context, { codigo }) {
        subjectInfoTab ??= await getSubjectInfoTab(codigo);
        if (!subjectInfoTab.url().endsWith(codigo.toString())) {
            await subjectInfoTab.goto(subjectInfoBaseUrl + codigo);
        }
        const subjectInfo = await subjectInfoTab.waitForSelector(subjectInfoQuerySelector, {
            timeout: 2_000,
        }).catch(() => null);
        if (!subjectInfo) {
            await context.fancyReply(`No se pudo encontrar el ramo con código ${codigo}.`);
            return;
        }
        const subjectName = await subjectInfo.evaluate(div => div.textContent.replace(new RegExp(` - ${codigo}$`), ''));
    }
}
exports.default = AddRamoCommand;
async function getSubjectInfoTab(codigo) {
    return await (0, puppeteer_1.getTabWithUrl)(subjectInfoBaseUrl) ?? await (0, puppeteer_1.openTab)(subjectInfoBaseUrl + codigo);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBQXlIO0FBQ3pILDRDQUFzRDtBQUV0RCxNQUFNLGtCQUFrQixHQUFHLG1EQUFtRCxDQUFDO0FBQy9FLElBQUksY0FBZ0MsQ0FBQztBQUNyQyxNQUFNLHdCQUF3QixHQUFHLCtDQUErQyxDQUFDO0FBRWpGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsSUFBSSxFQUFFLGtCQUFZLENBQUMsTUFBTTtRQUN6QixHQUFHLEVBQUUsQ0FBQztRQUNOLFFBQVEsRUFBRSxJQUFJO0tBQ2pCLENBQXNDLENBQUM7QUFLeEMsTUFBcUIsY0FBZSxTQUFRLGFBQWdCO0lBSXhELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUIsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLE1BQU0sRUFBYztRQUM1RCxjQUFjLEtBQUssTUFBTSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3BELE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxjQUFjLENBQUMsZUFBZSxDQUFDLHdCQUF3QixFQUFFO1lBQy9FLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2YsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLDJDQUEyQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQy9FLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ2hELEdBQUcsQ0FBQyxXQUFzQixDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3ZFLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFoQ0QsaUNBZ0NDO0FBRUQsS0FBSyxVQUFVLGlCQUFpQixDQUFDLE1BQWM7SUFDM0MsT0FBTyxNQUFNLElBQUEseUJBQWEsRUFBQyxrQkFBa0IsQ0FBQyxJQUFJLE1BQU0sSUFBQSxtQkFBTyxFQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ2pHLENBQUMifQ==