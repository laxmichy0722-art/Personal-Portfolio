"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Print trigger for the résumé.
 *
 * The résumé is rendered as HTML rather than linked as a PDF because there is no
 * PDF in the repository yet — a download link to a missing file is worse than
 * no link at all. Printing to PDF from the browser produces the same artefact
 * with no build step, and `print:` styles in `globals.css` handle the layout.
 */
export function PrintResume() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="rounded-xs print:hidden"
    >
      <Printer aria-hidden="true" />
      Save as PDF
    </Button>
  );
}