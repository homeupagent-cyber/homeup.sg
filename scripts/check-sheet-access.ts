/**
 * Read-only check that the listings Google Sheet can be fetched and parsed.
 * Prints counts only. No database reads or writes.
 * Run: npm run pg:sheet:check
 */
import path from "path";
import { fileURLToPath } from "url";
import { loadProjectEnv } from "../lib/scripts/load-env";
import {
  LISTINGS_SHEET_CREDENTIAL_ENV,
  listingsSheetServiceAccountEmail,
} from "../lib/listings/google-sheet-auth";
import { fetchListingsFromGoogleSheet } from "../lib/listings/google-sheet-listings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function main() {
  loadProjectEnv(root);

  const email = listingsSheetServiceAccountEmail();
  console.log(
    email
      ? `Logging in as service account: ${email}`
      : `${LISTINGS_SHEET_CREDENTIAL_ENV} not set: fetching the sheet without a login.`,
  );

  const sheet = await fetchListingsFromGoogleSheet();
  console.log("Sheet OK.");
  console.log("Rows with a PrtyGuru ID:", sheet.sheet_total_rows);
  console.log("Listed (would sync):", sheet.active.length);
  console.log("Sell:", sheet.sell_on_sheet, "Rent:", sheet.rent_on_sheet);
  console.log("Skipped:", sheet.skipped);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
