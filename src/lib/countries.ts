// 住所末尾の国名（日本語/英語）から ISO 3166-1 alpha-2 コードを返す。
// 国旗は flagcdn.com（例: https://flagcdn.com/w640/fr.png）で表示する。

const COUNTRY_CODES: Record<string, string> = {
  // 日本語
  日本: "jp",
  フランス: "fr",
  ドイツ: "de",
  イタリア: "it",
  スペイン: "es",
  イギリス: "gb",
  英国: "gb",
  アメリカ合衆国: "us",
  アメリカ: "us",
  米国: "us",
  韓国: "kr",
  大韓民国: "kr",
  台湾: "tw",
  中国: "cn",
  中華人民共和国: "cn",
  香港: "hk",
  マカオ: "mo",
  タイ: "th",
  ベトナム: "vn",
  シンガポール: "sg",
  マレーシア: "my",
  インドネシア: "id",
  フィリピン: "ph",
  インド: "in",
  カンボジア: "kh",
  オーストラリア: "au",
  ニュージーランド: "nz",
  カナダ: "ca",
  メキシコ: "mx",
  ブラジル: "br",
  アルゼンチン: "ar",
  ペルー: "pe",
  スイス: "ch",
  オーストリア: "at",
  オランダ: "nl",
  ベルギー: "be",
  ポルトガル: "pt",
  ギリシャ: "gr",
  トルコ: "tr",
  チェコ: "cz",
  ポーランド: "pl",
  ハンガリー: "hu",
  フィンランド: "fi",
  スウェーデン: "se",
  ノルウェー: "no",
  デンマーク: "dk",
  アイスランド: "is",
  アイルランド: "ie",
  クロアチア: "hr",
  ロシア: "ru",
  エジプト: "eg",
  モロッコ: "ma",
  南アフリカ: "za",
  ケニア: "ke",
  アラブ首長国連邦: "ae",
  カタール: "qa",
  // English fallbacks
  Japan: "jp",
  France: "fr",
  Germany: "de",
  Italy: "it",
  Spain: "es",
  "United States": "us",
  USA: "us",
  "United Kingdom": "gb",
  UK: "gb",
  "South Korea": "kr",
  Korea: "kr",
  Taiwan: "tw",
  China: "cn",
  "Hong Kong": "hk",
  Thailand: "th",
  Vietnam: "vn",
  Singapore: "sg",
  Malaysia: "my",
  Indonesia: "id",
  Philippines: "ph",
  India: "in",
  Australia: "au",
  "New Zealand": "nz",
  Canada: "ca",
  Switzerland: "ch",
  Austria: "at",
  Netherlands: "nl",
  Belgium: "be",
  Portugal: "pt",
  Greece: "gr",
  "Czech Republic": "cz",
  Czechia: "cz",
  Turkey: "tr",
};

// 住所からその国の ISO コードを推定（住所はカンマ区切りで末尾が国名）
export function countryCodeFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address
    .split(/[,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const code = COUNTRY_CODES[parts[i]];
    if (code) return code;
  }
  return null;
}

export function flagUrl(code: string): string {
  return `https://flagcdn.com/w640/${code}.png`;
}
