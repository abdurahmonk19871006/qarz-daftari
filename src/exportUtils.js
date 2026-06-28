import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { jsPDF } from "jspdf";

/* Saqlaydi (Cache papkasiga) va ulashish oynasini ochadi (Telegram, Drive va h.k.) */
async function saveAndShare(filename, base64Data, title) {
  const result = await Filesystem.writeFile({
    path: filename,
    data: base64Data,
    directory: Directory.Cache,
  });
  await Share.share({
    title: title || filename,
    url: result.uri,
    dialogTitle: "Faylni saqlash / yuborish",
  });
}

const b64FromText = (text) => {
  // UTF-8 xavfsiz base64 kodlash (kirillcha/o'zbekcha belgilar uchun ham ishlaydi)
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};

/* ═══ ZAXIRA (BACKUP) ═══ */
export async function exportBackup(contacts, txs, rems) {
  const payload = {
    app: "qarz-daftari",
    version: 1,
    exportedAt: new Date().toISOString(),
    contacts, txs, rems,
  };
  const json = JSON.stringify(payload, null, 2);
  const filename = `qarz-daftari-zaxira-${new Date().toISOString().slice(0,10)}.json`;
  await saveAndShare(filename, b64FromText(json), "Qarz Daftari — zaxira nusxa");
  return filename;
}

export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.contacts) || !Array.isArray(data.txs) || !Array.isArray(data.rems)) {
          reject(new Error("Fayl formati noto'g'ri"));
          return;
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsText(file);
  });
}

/* ═══ CSV EKSPORT ═══ */
const csvEscape = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function exportCSV(contacts, txs) {
  const rows = [["Ism", "Familiya", "Telefon", "Belgi", "Papka", "Sana", "Turi", "Miqdor (so'm)", "Izoh"]];
  const byId = Object.fromEntries(contacts.map(c => [c.id, c]));
  [...txs].sort((a,b)=>a.date.localeCompare(b.date)).forEach(t => {
    const c = byId[t.contactId];
    if (!c) return;
    rows.push([
      c.name, c.surname, c.phone, c.label || "", c.folder || "",
      t.date, t.type === "zaym" ? "Qarzga oldi" : "Qarzini qaytardi",
      t.amount, t.note || "",
    ]);
  });
  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const filename = `qarz-daftari-hisobot-${new Date().toISOString().slice(0,10)}.csv`;
  // Excel'da kirill/lotin harflar to'g'ri chiqishi uchun BOM qo'shamiz
  await saveAndShare(filename, b64FromText("\uFEFF" + csv), "Qarz Daftari — CSV hisobot");
  return filename;
}

/* ═══ PDF EKSPORT ═══ */
export async function exportPDF({ totalZ, totalQ, net, topContacts, numFmt }) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Qarz Daftari — Hisobot", 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleDateString("uz-UZ"), 14, y);
  doc.setTextColor(0);
  y += 12;

  doc.setFontSize(12);
  doc.text(`Qarzga olingan jami: ${numFmt(totalZ)}`, 14, y); y += 8;
  doc.text(`Qaytarilgan jami: ${numFmt(totalQ)}`, 14, y); y += 8;
  doc.setFontSize(13);
  doc.text(`Net balans: ${net >= 0 ? "+" : "-"}${numFmt(Math.abs(net))}`, 14, y); y += 12;

  doc.setFontSize(13);
  doc.text("Top kontaktlar:", 14, y); y += 8;
  doc.setFontSize(11);
  topContacts.forEach((c, i) => {
    if (y > 280) { doc.addPage(); y = 20; }
    const line = `${i + 1}. ${c.name} ${c.surname || ""}  —  ${c.balance >= 0 ? "+" : "-"}${numFmt(Math.abs(c.balance))}`;
    doc.text(line, 14, y);
    y += 7;
  });

  const base64 = doc.output("datauristring").split(",")[1];
  const filename = `qarz-daftari-hisobot-${new Date().toISOString().slice(0,10)}.pdf`;
  await saveAndShare(filename, base64, "Qarz Daftari — PDF hisobot");
  return filename;
}
