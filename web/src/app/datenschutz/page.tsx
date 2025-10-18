import LegalLayout from '@/components/LegalLayout';

export default function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung">
      <p><strong>Verantwortlich im Sinne der Datenschutzgesetze:</strong></p>
      <p>
        Natanael Haase<br />
        Großolbersdorfer Str. 42g<br />
        09430 Drebach<br />
        Deutschland<br />
  E-Mail: contact@repfinder.io
      </p>

      <h2>1. Erhebung und Speicherung personenbezogener Daten</h2>
      <p>
        Beim Besuch unserer Website werden automatisch Informationen (z. B. IP-Adresse, Browsertyp, Betriebssystem)
        durch den Server erfasst. Diese Daten werden ausschließlich zur Sicherstellung des technischen Betriebs verwendet
        und nicht an Dritte weitergegeben.
      </p>

      <h2>2. Verwendung von Google-Diensten</h2>
      <p>
        Unsere Website ruft Produktinformationen über die Google Sheets API ab. Dabei werden keine personenbezogenen
        Daten an Google übermittelt. Weitere Informationen finden Sie unter:
        <a target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1" href="https://policies.google.com/privacy">https://policies.google.com/privacy</a>
      </p>

      <h2>3. Affiliate-Links</h2>
      <p>
        Unsere Seite enthält Affiliate-Links zu externen Online-Shops. Beim Klicken auf einen solchen Link werden Sie zur
        jeweiligen externen Seite weitergeleitet. Wir haben keinen Einfluss darauf, welche Daten dort erhoben werden.
        Bitte informieren Sie sich über die Datenschutzerklärungen der jeweiligen Anbieter.
      </p>

      <h2>4. Cookies</h2>
      <p>
        Diese Website verwendet nur technisch notwendige Cookies, die für den Betrieb erforderlich sind. Tracking-Cookies
        oder personalisierte Werbung werden nicht eingesetzt.
      </p>

      <h2>5. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Widerspruch.
  Wenden Sie sich dazu an: contact@repfinder.io
      </p>

      <h2>6. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung gelegentlich anzupassen, um sie an aktuelle rechtliche
        Anforderungen oder technische Änderungen anzupassen.
      </p>
    </LegalLayout>
  );
}
