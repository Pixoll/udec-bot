import axios, { HttpStatusCode } from "axios";
import { parse as parseCsv } from "csv-parse/sync";
import { config as dotenv } from "dotenv";
import { mkdirSync } from "fs";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launch } from "puppeteer";
import XLSX, { Range } from "xlsx";

dotenv();

const { PY_API_PORT } = process.env;
const pdfFilesDir = path.join(process.cwd(), "resources/pdf");
let pdfId = 0;

if (existsSync(pdfFilesDir)) {
    rmSync(pdfFilesDir, {
        recursive: true,
        force: true,
    });
}

mkdirSync(pdfFilesDir, { recursive: true });

export async function pdfToCsv(pdfUrl: string): Promise<CsvSheet> {
    const id = pdfId++;
    const pdfFilePath = path.join(pdfFilesDir, `${id}`);

    const pdfArrayBuffer = await axios.get<ArrayBuffer>(pdfUrl, {
        responseType: "arraybuffer",
    }).then(r => r.data);
    writeFileSync(pdfFilePath, Buffer.from(pdfArrayBuffer));

    console.log(`Uploading [${id}] ${pdfUrl}`);
    using browser = await launch({
        // TODO not safe on linux, should find a workaround
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    using smallPdfPage = await browser.newPage();
    await smallPdfPage.goto("https://smallpdf.com/pdf-to-excel");
    const fileInputElement = await smallPdfPage.waitForSelector("input[type=file]");

    if (!fileInputElement) {
        throw new Error("Could not find file input element on page.");
    }

    await fileInputElement.uploadFile(pdfFilePath);
    const downloadFileElement = await smallPdfPage.waitForSelector("a[download]", { timeout: 0 });
    rmSync(pdfFilePath);
    console.log(`Uploaded [${id}]`);

    if (!downloadFileElement) {
        throw new Error("Could not find file download button element on page.");
    }

    const xlsxFilePath = await downloadFileElement.evaluate(a => a.href);
    console.log(`Downloading [${id}] ${xlsxFilePath}`);
    const xlsxArrayBuffer = await axios.get<ArrayBuffer>(xlsxFilePath, {
        responseType: "arraybuffer",
    }).then(r => r.data);
    console.log(`Downloaded [${id}]`);

    const form = new FormData();
    form.append("file", new Blob([xlsxArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }));
    const bordersResponse = await axios.post(
        `http://localhost:${PY_API_PORT}/udec-bot/api/parse-xlsx-borders`,
        form
    );
    if (bordersResponse.status !== HttpStatusCode.Ok) {
        throw new Error(bordersResponse.data.error);
    }

    const borders = bordersResponse.data as XlsxBorder[];
    console.log(borders);

    return await xlsxToCsv(Buffer.from(xlsxArrayBuffer));
}

async function xlsxToCsv(buffer: Buffer): Promise<CsvSheet> {
    const wb = XLSX.read(buffer, {
        cellFormula: false,
        cellHTML: false,
    });

    const sheets = Object.values(wb.Sheets).map<CsvSheet>((ws) => ({
        merges: ws["!merges"]?.map(range => ({
            ...range,
            toString() {
                return `${toLetter(this.s.c)}${this.s.r + 1}:${toLetter(this.e.c)}${this.e.r + 1}`;
            },
        })) ?? [],
        csv: parseCsv(XLSX.utils.sheet_to_csv(ws, {
            blankrows: false,
            strip: true,
        }).replaceAll("\ufeff", ""), {
            relaxColumnCount: true,
            trim: true,
        }),
    }));

    return sheets.reduce<CsvSheet>((joined, sheet) => {
        const rowCount = joined.csv.length;

        const newMerges = sheet.merges.map(range => {
            const newRange: Range = {
                ...range,
                s: { ...range.s },
                e: { ...range.e },
            };
            newRange.s.r += rowCount;
            newRange.e.r += rowCount;
            return newRange;
        });

        joined.merges.push(...newMerges);
        joined.csv.push(...sheet.csv);

        return joined;
    }, {
        merges: [],
        csv: [],
    });
}

function toLetter(n: number): string {
    const result: string[] = [];
    while (n >= 0) {
        result.push(String.fromCharCode(n % 26 + 65));
        n = Math.floor(n / 26) - 1;
    }
    return result.reverse().join("");
}

type CsvSheet = {
    csv: string[][];
    merges: Range[];
};

type XlsxBorder = {
    row: number;
    top: boolean;
    bottom: boolean;
};
