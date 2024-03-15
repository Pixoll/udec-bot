import { Page } from 'puppeteer';
import { TelegramClientType } from '../client';
import { ArgumentOptions, ArgumentOptionsToResult, ArgumentType, Command, CommandContext, TelegramClient } from '../lib';
import { getTabWithUrl, openTab } from '../puppeteer';

const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
let subjectInfoTab: Page | undefined;
const subjectInfoQuerySelector = '#node-25 > div > div > div > div:nth-child(1)';

const args = [{
    key: 'codigo',
    prompt: 'Código del ramo.',
    type: ArgumentType.Number,
    min: 0,
    required: true,
}] as const satisfies ArgumentOptions[];

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

export default class AddRamoCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'addramo',
            description: 'Añadir un ramo.',
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { codigo }: ArgsResult): Promise<void> {
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

        const subjectName = await subjectInfo.evaluate(div =>
            (div.textContent as string).replace(new RegExp(` - ${codigo}$`), '')
        );
    }
}

async function getSubjectInfoTab(codigo: number): Promise<Page> {
    return await getTabWithUrl(subjectInfoBaseUrl) ?? await openTab(subjectInfoBaseUrl + codigo);
}
