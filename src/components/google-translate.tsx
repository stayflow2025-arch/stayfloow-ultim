"use client";

import Script from "next/script";

export function GoogleTranslate() {
  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Script id="google-translate-config" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'fr',
              autoDisplay: false
            }, 'google_translate_element');
          }
        `}
      </Script>
    </>
  );
}
