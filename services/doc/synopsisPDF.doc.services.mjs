import path from "path";
import { readFileSync } from "fs";
import PdfPrinter from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import { changeCase } from "../../utils/index.js";

const __dirname = path.resolve();
var fonts = {
  Roboto: {
    italics: Buffer.from(
      readFileSync(__dirname + "/static/ArialItalic.ttf"),
      "base64"
    ),
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
};

const printer = new PdfPrinter({
  vfs: pdfFonts.pdfMake.vfs,
  ...fonts,
});

function createSynopsis(projects, event_name) {
  const coverImages = {
    cover1_concepts: readFileSync(path.join(__dirname, 'static/cover-pages/cover1_concepts.jpeg')),
    cover1_impetus: readFileSync(path.join(__dirname, 'static/cover-pages/cover1_impetus.png')),
    cover2: readFileSync(path.join(__dirname, 'static/cover-pages/cover2.jpeg')),
    cover3: readFileSync(path.join(__dirname, 'static/cover-pages/cover3.jpeg')),
    cover4: readFileSync(path.join(__dirname, 'static/cover-pages/cover4.jpeg')),
    cover5: readFileSync(path.join(__dirname, 'static/cover-pages/cover5.jpeg')),
    cover6: readFileSync(path.join(__dirname, 'static/cover-pages/cover6.jpeg')),
    cover7_concepts: readFileSync(path.join(__dirname, 'static/cover-pages/cover7_concepts.jpeg')),
    cover7_impetus: readFileSync(path.join(__dirname, 'static/cover-pages/cover7_impetus.png')),
  };
  
  const AD = projects["APPLICATION DEVELOPMENT"];
  const CN = projects["COMMUNICATION NETWORKS AND SECURITY SYSTEMS"];
  const DS = projects["DIGITAL / IMAGE/ SPEECH / VIDEO PROCESSING"];
  const ES = projects["EMBEDDED/VLSI SYSTEMS"];
  const ML = projects["MACHINE LEARNING AND PATTERN RECOGNITION"];
  const OT = projects["OTHERS"];

  // Helper function to normalize text by removing extra whitespace and newlines
  const normalizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim();
  };

  const docDefinition = {
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: true,
    },

    header: function(currentPage) {
      if (currentPage <= 6 || currentPage === docDefinition.content.length) {
        return null;
      }
      
      return [
        {
          columns: [
            {
              text: "Pune Institute of Computer Technology, Pune-43",
              fontSize: 10,
              italics: true,
              alignment: "left",
            },
            {
              text: `${event_name} Synopsis: InC 2025`,
              fontSize: 10,
              italics: true,
              alignment: "right",
            },
          ],
          margin: [60, 20, 60, 0],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 60,
              y1: 5,
              x2: 535,
              y2: 5,
              lineWidth: 1,
            },
          ],
        },
      ];
    },
    
    footer: function(currentPage, pageCount) {
      if (currentPage <= 6 || currentPage === pageCount) {
        return null;
      }
      
      return [
        {
          canvas: [
            {
              type: "line",
              x1: 60,
              y1: 5,
              x2: 535,
              y2: 5,
              lineWidth: 1,
            },
          ],
        },
        {
          text: `${currentPage - 6} of ${pageCount - 7}`,
          fontSize: 10,
          italics: true,
          alignment: "center",
          margin: [0, 10, 0, 0],
        },
      ];
    },
    
    content: [
      {
        image: event_name?.toLowerCase() === 'impetus' ? coverImages.cover1_impetus : coverImages.cover1_concepts,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'after'
      },
      {
        image: coverImages.cover2,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'after'
      },
      {
        image: coverImages.cover3,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'after'
      },
      {
        image: coverImages.cover4,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'after'
      },
      {
        image: coverImages.cover5,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'after'
      },
      {
        image: coverImages.cover6,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'after'
      },
      
      // TOC header
      {
        toc: {
          title: {
            text: "CONTENTS",
            style: "header",
            alignment: "center",
            fontSize: 24,
            bold: true,
            margin: [0, 20, 0, 40],
          },
          textMargin: [0, 5, 0, 5],
          numberStyle: { bold: true },
          numberMargin: [5, 5, 10, 5],
          pagebreak: "after",
        },
      },
      
      // Application Development section
      ...(AD.length ? [{
        text: "APPLICATION DEVELOPMENT, DATABASE, SYSTEM APPLICATIONS, BIG DATA",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 20],
        pageBreak: "before",
        tocItem: true,
        alignment: "center",
        tocStyle: { bold: true, fontSize: 16 },
      }] : []),
      
      ...AD.map((project) => [
        {
          text: `${project.pid}: ${changeCase("sentence", project.title)}`,
          fontSize: 14,
          bold: true,
          tocItem: true,
          tocMargin: [20, 0, 0, 0],
          margin: [0, 10, 0, 8],
          tocStyle: { fontSize: 12, alignment: "justify" },
        },
        {
          columns: [
            {
              text: "Abstract:",
              fontSize: 12,
              bold: true,
              width: "auto",
              margin: [0, 0, 5, 0],
            },
            {
              text: normalizeText(project.abstract),
              fontSize: 12,
              width: "*",
              alignment: "justify",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 475,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#aaa",
            },
          ],
          margin: [0, 15, 0, 15],
        },
      ]),
      
      // Communication Networks section
      ...(CN.length ? [{
        text: "COMMUNICATION, NETWORKING, SECURITY, BLOCKCHAIN, CLOUD COMPUTING",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 20],
        pageBreak: "before",
        tocItem: true,
        alignment: "center",
        tocStyle: { bold: true, fontSize: 16 },
      }] : []),
      
      ...CN.map((project) => [
        {
          text: `${project.pid}: ${changeCase("sentence", project.title)}`,
          fontSize: 14,
          bold: true,
          tocItem: true,
          tocMargin: [20, 0, 0, 0],
          margin: [0, 10, 0, 8],
          tocStyle: { fontSize: 12, alignment: "justify" },
        },
        {
          columns: [
            {
              text: "Abstract:",
              fontSize: 12,
              bold: true,
              width: "auto",
              margin: [0, 0, 5, 0],
            },
            {
              text: normalizeText(project.abstract),
              fontSize: 12,
              width: "*",
              alignment: "justify",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 475,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#aaa",
            },
          ],
          margin: [0, 15, 0, 15],
        },
      ]),
      
      // Image Processing section
      ...(DS.length ? [{
        text: "IMAGE PROCESSING, DSP, MULTIMEDIA",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 20],
        pageBreak: "before",
        tocItem: true,
        alignment: "center",
        tocStyle: { bold: true, fontSize: 16 },
      }] : []),
      
      ...DS.map((project) => [
        {
          text: `${project.pid}: ${changeCase("sentence", project.title)}`,
          fontSize: 14,
          bold: true,
          tocItem: true,
          tocMargin: [20, 0, 0, 0],
          margin: [0, 10, 0, 8],
          tocStyle: { fontSize: 12, alignment: "justify" },
        },
        {
          columns: [
            {
              text: "Abstract:",
              fontSize: 12,
              bold: true,
              width: "auto",
              margin: [0, 0, 5, 0],
            },
            {
              text: normalizeText(project.abstract),
              fontSize: 12,
              width: "*",
              alignment: "justify",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 475,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#aaa",
            },
          ],
          margin: [0, 15, 0, 15],
        },
      ]),

      // Embedded Systems section
      ...(ES.length ? [{
        text: "EMBEDDED SYSTEMS, VLSI, IOT, REMOTE SENSING",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 20],
        pageBreak: "before",
        tocItem: true,
        alignment: "center",
        tocStyle: { bold: true, fontSize: 16 },
      }] : []),
      
      ...ES.map((project) => [
        {
          text: `${project.pid}: ${changeCase("sentence", project.title)}`,
          fontSize: 14,
          bold: true,
          tocItem: true,
          tocMargin: [20, 0, 0, 0],
          margin: [0, 10, 0, 8],
          tocStyle: { fontSize: 12, alignment: "justify" },
        },
        {
          columns: [
            {
              text: "Abstract:",
              fontSize: 12,
              bold: true,
              width: "auto",
              margin: [0, 0, 5, 0],
            },
            {
              text: normalizeText(project.abstract),
              fontSize: 12,
              width: "*",
              alignment: "justify",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 475,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#aaa",
            },
          ],
          margin: [0, 15, 0, 15],
        },
      ]),

      // Machine Learning section
      ...(ML.length ? [{
        text: "MACHINE LEARNING, PATTERN RECOGNITION, ARTIFICIAL INTELLIGENCE, EXPERT SYSTEM",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 20],
        pageBreak: "before",
        tocItem: true,
        alignment: "center",
        tocStyle: { bold: true, fontSize: 16 },
      }] : []),

      ...ML.map((project) => [
        {
          text: `${project.pid}: ${changeCase("sentence", project.title)}`,
          fontSize: 14,
          bold: true,
          tocItem: true,
          tocMargin: [20, 0, 0, 0],
          margin: [0, 10, 0, 8],
          tocStyle: { fontSize: 12, alignment: "justify" },
        },
        {
          columns: [
            {
              text: "Abstract:",
              fontSize: 12,
              bold: true,
              width: "auto",
              margin: [0, 0, 5, 0],
            },
            {
              text: normalizeText(project.abstract),
              fontSize: 12,
              width: "*",
              alignment: "justify",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 475,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#aaa",
            },
          ],
          margin: [0, 15, 0, 15],
        },
      ]),

      // Others section
      ...(OT.length ? [{
        text: "OTHERS (BIO-SIGNAL PROCESSING, BIOMEDICAL, BIOINFORMATICS, ETC.)",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 20],
        pageBreak: "before",
        tocItem: true,
        alignment: "center",
        tocStyle: { bold: true, fontSize: 16 },
      }] : []),
      
      ...OT.map((project) => [
        {
          text: `${project.pid}: ${changeCase("sentence", project.title)}`,
          fontSize: 14,
          bold: true,
          tocItem: true,
          tocMargin: [20, 0, 0, 0],
          margin: [0, 10, 0, 8],
          tocStyle: { fontSize: 12, alignment: "justify" },
        },
        {
          columns: [
            {
              text: "Abstract:",
              fontSize: 12,
              bold: true,
              width: "auto",
              margin: [0, 0, 5, 0],
            },
            {
              text: normalizeText(project.abstract),
              fontSize: 12,
              width: "*",
              alignment: "justify",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 475,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#aaa",
            },
          ],
          margin: [0, 15, 0, 15],
        },
      ]),
      
      {
        image: event_name?.toLowerCase() === 'impetus' ? coverImages.cover7_impetus : coverImages.cover7_concepts,
        absolutePosition: { x: 0, y: 0 },
        width: 595,
        height: 842,
        pageBreak: 'before'
      }
    ],
    
    pageMargins: [60, 60, 60, 60],
    defaultStyle: {
      font: "Times",
    },
  };

  return printer.createPdfKitDocument(docDefinition);
}

export default createSynopsis;
