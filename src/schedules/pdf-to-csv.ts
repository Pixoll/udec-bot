import axios, { HttpStatusCode } from "axios";
import { parse as parseCsv } from "csv-parse/sync";
import { config as dotenv } from "dotenv";
import { mkdirSync } from "fs";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launch } from "puppeteer";
import XLSX, { Range } from "xlsx";
import { Logger } from "../lib";

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

export async function pdfToCsv(pdfUrl: string, options?: PdfToCsvOptions): Promise<Csv> {
    const id = pdfId++;
    const pdfFilePath = path.join(pdfFilesDir, `${id}`);

    const pdfArrayBuffer = await axios.get<ArrayBuffer>(pdfUrl, {
        responseType: "arraybuffer",
    }).then(r => r.data);
    writeFileSync(pdfFilePath, Buffer.from(pdfArrayBuffer));

    Logger.info(`Uploading [${id}] ${pdfUrl}`);
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
    Logger.info(`Uploaded [${id}]`);

    if (!downloadFileElement) {
        throw new Error("Could not find file download button element on page.");
    }

    const xlsxFilePath = await downloadFileElement.evaluate(a => a.href);
    Logger.info(`Downloading [${id}] ${xlsxFilePath}`);
    const xlsxArrayBuffer = await axios.get<ArrayBuffer>(xlsxFilePath, {
        responseType: "arraybuffer",
    }).then(r => r.data);
    Logger.info(`Downloaded [${id}]`);

    const csvSheet = await xlsxToCsv(Buffer.from(xlsxArrayBuffer));
    if (!options?.mergeRows) {
        return csvSheet.csv;
    }

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

    return mergeRows(csvSheet, borders);
}

async function xlsxToCsv(buffer: Buffer): Promise<CsvWithMerges> {
    const wb = XLSX.read(buffer, {
        cellFormula: false,
        cellHTML: false,
    });

    const sheets = Object.values(wb.Sheets).map<CsvWithMerges>((ws) => ({
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

    return sheets.reduce<CsvWithMerges>((joined, sheet) => {
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

function mergeRows({ csv, merges }: CsvWithMerges, borders: XlsxBorder[]): Csv {
    const mergeRanges = new Map<number, number>();
    for (const merge of merges) {
        const start = merge.s.r;
        const end = merge.e.r;
        if (end > start) {
            mergeRanges.set(start, Math.max(mergeRanges.get(start) ?? end, end));
        }
    }

    for (let i = 0; i < borders.length; i++) {
        const { row: start, top, bottom } = borders[i]!;
        if (!top || bottom) continue;

        let end = start;
        while (++i < borders.length) {
            const { row, top, bottom } = borders[i]!;
            if (top) {
                end = row - 1;
                break;
            }
            if (bottom) {
                end = row;
                break;
            }
        }

        if (end === start) {
            i--;
            continue;
        }

        mergeRanges.set(start, Math.max(mergeRanges.get(start) ?? end, end));
    }

    const merged: Csv = [];

    for (let i = 0; i < csv.length; i++) {
        const row = [...csv[i]!];
        const j = mergeRanges.get(i);
        if (!j) {
            merged.push(row);
            continue;
        }

        do {
            const other = csv[++i]!;
            for (let k = 0; k < other.length; k++) {
                row[k] = ((row[k] ?? "") + "\n" + (other[k] ?? "")).trim();
            }
        } while (i < j);

        merged.push(row);
    }

    return merged;
}

function toLetter(n: number): string {
    const result: string[] = [];
    while (n >= 0) {
        result.push(String.fromCharCode(n % 26 + 65));
        n = Math.floor(n / 26) - 1;
    }
    return result.reverse().join("");
}

type PdfToCsvOptions = {
    mergeRows?: boolean;
};

type CsvWithMerges = {
    csv: Csv;
    merges: Range[];
};

type Csv = string[][];

type XlsxBorder = {
    row: number;
    top: boolean;
    bottom: boolean;
};
