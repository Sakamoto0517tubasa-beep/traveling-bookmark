// 旅行先の国の基本情報（渡航前に知っておきたいこと）。
// ISO 3166-1 alpha-2（小文字）で引く。countries.ts の countryCodeFromAddress の戻り値に対応。
// ※ 情報は目安です。ビザ・治安など最新情報は外務省の海外安全ホームページ等で確認してください。

export type CountryInfo = {
  name: string; // 日本語国名
  currency: string; // 通貨
  plug: string; // 電圧・プラグ形状
  tipping: string; // チップ
  emergency: string; // 緊急番号
  water: string; // 水道水
  timeDiff: string; // 日本との時差
  visa: string; // ビザ（日本国籍・短期観光）
  tips: string; // ひとことメモ
  // --- 追加（任意）---
  language?: string; // 公用語
  langCode?: string; // Google翻訳用の言語コード
  hello?: string; // 現地語「こんにちは」
  thanks?: string; // 現地語「ありがとう」
  payment?: string; // 支払い事情（現金・カード）
  bestSeason?: string; // ベストシーズン
  phraseGroups?: PhraseGroup[]; // カテゴリ別の現地フレーズ集
};

export type PhraseGroup = { title: string; items: { ja: string; local: string }[] };

// 英語圏共通のフレーズ（カテゴリ別）
const EN_GROUPS: PhraseGroup[] = [
  {
    title: "あいさつ・基本",
    items: [
      { ja: "こんにちは", local: "Hello（ハロー）" },
      { ja: "やあ", local: "Hi（ハイ）" },
      { ja: "おはよう", local: "Good morning（グッモーニング）" },
      { ja: "さようなら", local: "Goodbye（グッバイ）" },
      { ja: "ありがとう", local: "Thank you（サンキュー）" },
      { ja: "どういたしまして", local: "You're welcome（ユア ウェルカム）" },
      { ja: "お願いします", local: "Please（プリーズ）" },
      { ja: "ごめんなさい", local: "I'm sorry（アイム ソーリー）" },
      { ja: "すみません（呼びかけ）", local: "Excuse me（エクスキューズ ミー）" },
      { ja: "はい / いいえ", local: "Yes / No（イエス / ノー）" },
    ],
  },
  {
    title: "返事・お願い",
    items: [
      { ja: "OKです", local: "OK / Sure（オーケー / シュア）" },
      { ja: "わかりません", local: "I don't understand（アイ ドント アンダスタンド）" },
      { ja: "英語を話せますか？", local: "Do you speak English?（ドゥ ユー スピーク イングリッシュ）" },
      { ja: "もう一度お願いします", local: "Could you repeat that?（クッジュー リピート ザット）" },
      { ja: "ゆっくり話してください", local: "Please speak slowly（プリーズ スピーク スローリー）" },
    ],
  },
  {
    title: "レストラン・食事",
    items: [
      { ja: "メニューをください", local: "Can I see the menu?（キャナイ シー ザ メニュー）" },
      { ja: "これをください", local: "I'll have this（アイル ハヴ ディス）" },
      { ja: "お会計お願いします", local: "Check, please（チェック プリーズ）" },
      { ja: "おいしい！", local: "It's delicious!（イッツ デリシャス）" },
      { ja: "乾杯！", local: "Cheers!（チアーズ）" },
    ],
  },
  {
    title: "買い物・お金",
    items: [
      { ja: "いくらですか？", local: "How much is it?（ハウ マッチ イズ イット）" },
      { ja: "カードで払えますか？", local: "Can I pay by card?（キャナイ ペイ バイ カード）" },
      { ja: "見ているだけです", local: "I'm just looking（アイム ジャスト ルッキング）" },
      { ja: "これください", local: "I'll take this（アイル テイク ディス）" },
    ],
  },
  {
    title: "移動・道案内",
    items: [
      { ja: "〜はどこですか？", local: "Where is ...?（ウェア イズ）" },
      { ja: "トイレはどこ？", local: "Where is the toilet?（ウェア イズ ザ トイレット）" },
      { ja: "ここに行きたい（地図を見せて）", local: "I want to go here（アイ ウォント トゥ ゴー ヒア）" },
      { ja: "まっすぐ / 右 / 左", local: "Straight / right / left（ストレート / ライト / レフト）" },
    ],
  },
  {
    title: "困ったとき",
    items: [
      { ja: "道に迷いました", local: "I'm lost（アイム ロスト）" },
      { ja: "助けて！", local: "Help!（ヘルプ）" },
      { ja: "警察を呼んでください", local: "Call the police（コール ザ ポリス）" },
      { ja: "気分が悪いです", local: "I feel sick（アイ フィール シック）" },
    ],
  },
];

// カテゴリ別の現地フレーズ集
const PHRASE_GROUPS: Record<string, PhraseGroup[]> = {
  fr: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "Bonjour（ボンジュール）" },
        { ja: "こんばんは", local: "Bonsoir（ボンソワール）" },
        { ja: "やあ / バイバイ", local: "Salut（サリュ）" },
        { ja: "さようなら", local: "Au revoir（オ ルヴォワール）" },
        { ja: "おやすみなさい", local: "Bonne nuit（ボンニュイ）" },
        { ja: "ありがとう", local: "Merci（メルシー）" },
        { ja: "どういたしまして", local: "De rien（ドゥ リアン）" },
        { ja: "お願いします", local: "S'il vous plaît（シルヴプレ）" },
        { ja: "ごめんなさい", local: "Pardon（パルドン）" },
        { ja: "すみません（呼びかけ）", local: "Excusez-moi（エクスキュゼ モワ）" },
        { ja: "はい / いいえ", local: "Oui / Non（ウィ / ノン）" },
      ],
    },
    {
      title: "返事・お願い",
      items: [
        { ja: "OKです", local: "D'accord（ダコール）" },
        { ja: "わかりません", local: "Je ne comprends pas（ジュ ヌ コンプラン パ）" },
        { ja: "英語を話せますか？", local: "Vous parlez anglais ?（ヴ パルレ アングレ）" },
        { ja: "もう一度お願いします", local: "Répétez, s'il vous plaît（レペテ シルヴプレ）" },
        { ja: "大丈夫です", local: "Ça va（サ ヴァ）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューをください", local: "La carte, s'il vous plaît（ラ カルト シルヴプレ）" },
        { ja: "これをください", local: "Je voudrais ça（ジュ ヴドレ サ）" },
        { ja: "お会計お願いします", local: "L'addition, s'il vous plaît（ラディシオン シルヴプレ）" },
        { ja: "水をください", local: "De l'eau, s'il vous plaît（ドゥ ロー シルヴプレ）" },
        { ja: "おいしい！", local: "C'est délicieux !（セ デリシュ）" },
        { ja: "乾杯！", local: "Santé !（サンテ）" },
      ],
    },
    {
      title: "買い物・お金",
      items: [
        { ja: "いくらですか？", local: "C'est combien ?（セ コンビヤン）" },
        { ja: "高いです", local: "C'est cher（セ シェール）" },
        { ja: "これください", local: "Je prends ça（ジュ プラン サ）" },
        { ja: "カードで払えますか？", local: "Je peux payer par carte ?（ジュ プ ペイエ パル カルト）" },
        { ja: "見ているだけです", local: "Je regarde（ジュ ルガルド）" },
      ],
    },
    {
      title: "移動・道案内",
      items: [
        { ja: "〜はどこですか？", local: "Où est... ?（ウ エ）" },
        { ja: "トイレはどこ？", local: "Où sont les toilettes ?（ウ ソン レ トワレット）" },
        { ja: "駅はどこ？", local: "Où est la gare ?（ウ エ ラ ガール）" },
        { ja: "まっすぐ / 右 / 左", local: "Tout droit / à droite / à gauche（トゥ ドロワ / ア ドロワット / ア ゴーシュ）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "道に迷いました", local: "Je suis perdu(e)（ジュ スュイ ペルデュ）" },
        { ja: "助けて！", local: "Au secours !（オ スクール）" },
        { ja: "警察を呼んでください", local: "Appelez la police（アプレ ラ ポリス）" },
        { ja: "気分が悪いです", local: "Je me sens mal（ジュ ム サン マル）" },
      ],
    },
  ],
  it: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "Buongiorno（ボンジョルノ）" },
        { ja: "こんばんは", local: "Buonasera（ボナセーラ）" },
        { ja: "やあ / バイバイ", local: "Ciao（チャオ）" },
        { ja: "さようなら", local: "Arrivederci（アリヴェデルチ）" },
        { ja: "ありがとう", local: "Grazie（グラッツィエ）" },
        { ja: "どういたしまして", local: "Prego（プレーゴ）" },
        { ja: "お願いします", local: "Per favore（ペル ファヴォーレ）" },
        { ja: "すみません", local: "Scusi（スクーズィ）" },
        { ja: "はい / いいえ", local: "Sì / No（シ / ノ）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューをください", local: "Il menu, per favore（イル メヌ ペル ファヴォーレ）" },
        { ja: "お会計お願いします", local: "Il conto, per favore（イル コント ペル ファヴォーレ）" },
        { ja: "おいしい！", local: "È buono!（エ ブオーノ）" },
        { ja: "乾杯！", local: "Salute!（サルーテ）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "Quanto costa?（クアント コスタ）" },
        { ja: "カードで払えますか？", local: "Posso pagare con la carta?（ポッソ パガーレ コン ラ カルタ）" },
        { ja: "〜はどこですか？", local: "Dov'è...?（ドヴェ）" },
        { ja: "トイレはどこ？", local: "Dov'è il bagno?（ドヴェ イル バーニョ）" },
        { ja: "まっすぐ / 右 / 左", local: "Dritto / destra / sinistra（ドリット / デストラ / シニストラ）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "道に迷いました", local: "Mi sono perso（ミ ソノ ペルソ）" },
        { ja: "助けて！", local: "Aiuto!（アイユート）" },
        { ja: "英語を話せますか？", local: "Parla inglese?（パルラ イングレーゼ）" },
      ],
    },
  ],
  es: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "Hola（オラ）" },
        { ja: "おはよう", local: "Buenos días（ブエノス ディアス）" },
        { ja: "こんばんは", local: "Buenas noches（ブエナス ノチェス）" },
        { ja: "さようなら", local: "Adiós（アディオス）" },
        { ja: "ありがとう", local: "Gracias（グラシアス）" },
        { ja: "どういたしまして", local: "De nada（デ ナダ）" },
        { ja: "お願いします", local: "Por favor（ポル ファボール）" },
        { ja: "すみません", local: "Perdón（ペルドン）" },
        { ja: "はい / いいえ", local: "Sí / No（シ / ノ）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューをください", local: "La carta, por favor（ラ カルタ ポル ファボール）" },
        { ja: "お会計お願いします", local: "La cuenta, por favor（ラ クエンタ ポル ファボール）" },
        { ja: "おいしい！", local: "¡Está rico!（エスタ リコ）" },
        { ja: "乾杯！", local: "¡Salud!（サルー）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "¿Cuánto cuesta?（クアント クエスタ）" },
        { ja: "カードで払えますか？", local: "¿Puedo pagar con tarjeta?（プエド パガール コン タルヘタ）" },
        { ja: "〜はどこですか？", local: "¿Dónde está...?（ドンデ エスタ）" },
        { ja: "トイレはどこ？", local: "¿Dónde está el baño?（ドンデ エスタ エル バニョ）" },
        { ja: "まっすぐ / 右 / 左", local: "Recto / derecha / izquierda（レクト / デレチャ / イスキエルダ）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "道に迷いました", local: "Estoy perdido（エストイ ペルディード）" },
        { ja: "助けて！", local: "¡Ayuda!（アユダ）" },
        { ja: "英語を話せますか？", local: "¿Habla inglés?（アブラ イングレス）" },
      ],
    },
  ],
  de: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "Guten Tag（グーテン ターク）" },
        { ja: "おはよう", local: "Guten Morgen（グーテン モルゲン）" },
        { ja: "やあ / バイバイ", local: "Tschüss（チュース）" },
        { ja: "さようなら", local: "Auf Wiedersehen（アウフ ヴィーダーゼーエン）" },
        { ja: "ありがとう", local: "Danke（ダンケ）" },
        { ja: "お願いします / どうぞ", local: "Bitte（ビッテ）" },
        { ja: "すみません", local: "Entschuldigung（エントシュルディグング）" },
        { ja: "はい / いいえ", local: "Ja / Nein（ヤー / ナイン）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューをください", local: "Die Karte, bitte（ディー カルテ ビッテ）" },
        { ja: "お会計お願いします", local: "Die Rechnung, bitte（ディー レヒヌング ビッテ）" },
        { ja: "おいしい！", local: "Das schmeckt gut!（ダス シュメックト グート）" },
        { ja: "乾杯！", local: "Prost!（プロースト）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "Was kostet das?（ヴァス コステット ダス）" },
        { ja: "カードで払えますか？", local: "Kann ich mit Karte zahlen?（カン イッヒ ミット カルテ ツァーレン）" },
        { ja: "〜はどこですか？", local: "Wo ist...?（ヴォー イスト）" },
        { ja: "トイレはどこ？", local: "Wo ist die Toilette?（ヴォー イスト ディー トワレッテ）" },
        { ja: "まっすぐ / 右 / 左", local: "Geradeaus / rechts / links（ゲラーデアウス / レヒツ / リンクス）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "道に迷いました", local: "Ich habe mich verlaufen（イッヒ ハーベ ミッヒ フェアラウフェン）" },
        { ja: "助けて！", local: "Hilfe!（ヒルフェ）" },
        { ja: "英語を話せますか？", local: "Sprechen Sie Englisch?（シュプレッヒェン ズィー エングリッシュ）" },
      ],
    },
  ],
  gb: EN_GROUPS,
  us: EN_GROUPS,
  au: EN_GROUPS,
  sg: EN_GROUPS,
  kr: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "안녕하세요（アンニョンハセヨ）" },
        { ja: "ありがとう", local: "감사합니다（カムサハムニダ）" },
        { ja: "すみません（呼びかけ）", local: "저기요（チョギヨ）" },
        { ja: "ごめんなさい", local: "죄송합니다（チェソンハムニダ）" },
        { ja: "お願いします（ください）", local: "주세요（ジュセヨ）" },
        { ja: "はい / いいえ", local: "네 / 아니요（ネ / アニヨ）" },
        { ja: "さようなら", local: "안녕히 가세요（アンニョンヒ カセヨ）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューください", local: "메뉴 주세요（メニュ ジュセヨ）" },
        { ja: "これください", local: "이거 주세요（イゴ ジュセヨ）" },
        { ja: "お会計お願いします", local: "계산해 주세요（ケサンヘ ジュセヨ）" },
        { ja: "おいしい！", local: "맛있어요（マシッソヨ）" },
        { ja: "乾杯！", local: "건배（コンベ）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "얼마예요?（オルマエヨ）" },
        { ja: "カードで払えますか？", local: "카드 돼요?（カドゥ ドェヨ）" },
        { ja: "〜はどこですか？", local: "어디예요?（オディエヨ）" },
        { ja: "トイレはどこ？", local: "화장실 어디예요?（ファジャンシル オディエヨ）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "英語できますか？", local: "영어 할 수 있어요?（ヨンオ ハル ス イッソヨ）" },
        { ja: "助けて！", local: "도와주세요（トワジュセヨ）" },
      ],
    },
  ],
  tw: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "你好（ニーハオ）" },
        { ja: "ありがとう", local: "謝謝（シェイシェイ）" },
        { ja: "すみません", local: "不好意思（ブーハオイースー）" },
        { ja: "ごめんなさい", local: "對不起（ドゥイブチー）" },
        { ja: "はい / いいえ", local: "對 / 不對（ドゥイ / ブードゥイ）" },
        { ja: "さようなら", local: "再見（ザイジエン）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューください", local: "菜單（ツァイダン）" },
        { ja: "これください", local: "我要這個（ウォー ヤオ ジェガ）" },
        { ja: "お会計お願いします", local: "買單（マイダン）" },
        { ja: "おいしい", local: "好吃（ハオチー）" },
        { ja: "乾杯！", local: "乾杯（ガンベイ）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "多少錢？（ドゥオシャオチエン）" },
        { ja: "カードで払えますか？", local: "可以刷卡嗎？（クーイー シュアカー マ）" },
        { ja: "〜はどこですか？", local: "在哪裡？（ザイ ナーリー）" },
        { ja: "トイレはどこ？", local: "廁所在哪裡？（ツァースオ ザイ ナーリー）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "英語できますか？", local: "你會説英文嗎？（ニー フイ シュオ インウェン マ）" },
        { ja: "助けて！", local: "救命！（ジウミン）" },
      ],
    },
  ],
  th: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "สวัสดี（サワッディー）" },
        { ja: "ありがとう", local: "ขอบคุณ（コープクン）" },
        { ja: "すみません / ごめん", local: "ขอโทษ（コートート）" },
        { ja: "はい / いいえ", local: "ใช่ / ไม่（チャイ / マイ）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューください", local: "ขอเมนู（コー メニュー）" },
        { ja: "お会計お願いします", local: "เช็คบิล（チェックビン）" },
        { ja: "おいしい", local: "อร่อย（アロイ）" },
        { ja: "辛くしないで", local: "ไม่เผ็ด（マイ ペット）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "เท่าไหร่？（タオライ）" },
        { ja: "高い", local: "แพง（ペーン）" },
        { ja: "トイレはどこ？", local: "ห้องน้ำอยู่ไหน？（ホンナーム ユー ナイ）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "助けて！", local: "ช่วยด้วย（チュアイ ドゥアイ）" },
        { ja: "英語できますか？", local: "พูดอังกฤษได้ไหม？（プート アングリット ダイ マイ）" },
      ],
    },
  ],
  vn: [
    {
      title: "あいさつ・基本",
      items: [
        { ja: "こんにちは", local: "Xin chào（シンチャオ）" },
        { ja: "ありがとう", local: "Cảm ơn（カムオン）" },
        { ja: "すみません / ごめん", local: "Xin lỗi（シンローイ）" },
        { ja: "はい / いいえ", local: "Vâng / Không（ヴァン / コン）" },
        { ja: "さようなら", local: "Tạm biệt（タム ビエット）" },
      ],
    },
    {
      title: "レストラン・食事",
      items: [
        { ja: "メニューください", local: "Cho tôi xem thực đơn（チョー トイ セム トゥックドン）" },
        { ja: "お会計お願いします", local: "Tính tiền（ティン ティエン）" },
        { ja: "おいしい", local: "Ngon（ゴン）" },
      ],
    },
    {
      title: "買い物・移動",
      items: [
        { ja: "いくらですか？", local: "Bao nhiêu tiền?（バオ ニュー ティエン）" },
        { ja: "高い", local: "Đắt quá（ダッ クア）" },
        { ja: "トイレはどこ？", local: "Nhà vệ sinh ở đâu?（ニャー ヴェ シン オ ダウ）" },
      ],
    },
    {
      title: "困ったとき",
      items: [
        { ja: "助けて！", local: "Cứu với!（クー ヴォイ）" },
        { ja: "英語できますか？", local: "Bạn nói tiếng Anh được không?（バン ノイ ティエン アイン ドゥオック コン）" },
      ],
    },
  ],
};

// 追加情報（あいさつ・言語・支払い・ベストシーズン）。基本情報にマージして使う。
const COUNTRY_EXTRA: Record<string, Partial<CountryInfo>> = {
  fr: { language: "フランス語", langCode: "fr", hello: "ボンジュール（Bonjour）", thanks: "メルシー（Merci）", payment: "カードがほぼどこでも使える。少額の現金も用意すると安心", bestSeason: "春（4〜6月）と秋（9〜10月）が快適" },
  it: { language: "イタリア語", langCode: "it", hello: "ボンジョルノ（Buongiorno）", thanks: "グラッツィエ（Grazie）", payment: "カード可の店が多いが、小さな店は現金も", bestSeason: "春（4〜6月）と秋（9〜10月）" },
  es: { language: "スペイン語", langCode: "es", hello: "オラ（Hola）", thanks: "グラシアス（Gracias）", payment: "カード広く使える。夜は遅めの生活リズム", bestSeason: "春（4〜6月）と秋（9〜10月）" },
  de: { language: "ドイツ語", langCode: "de", hello: "グーテンターク（Guten Tag）", thanks: "ダンケ（Danke）", payment: "現金文化が根強い。小額現金は必須級", bestSeason: "初夏〜秋（5〜10月）" },
  gb: { language: "英語", langCode: "en", hello: "ハロー（Hello）", thanks: "サンキュー（Thank you）", payment: "ほぼ完全キャッシュレス。タッチ決済が主流", bestSeason: "初夏〜初秋（5〜9月）" },
  us: { language: "英語", langCode: "en", hello: "ハロー（Hello）", thanks: "サンキュー（Thank you）", payment: "カード社会。チップ文化があるので少額現金も", bestSeason: "都市により異なる（春・秋が快適）" },
  kr: { language: "韓国語", langCode: "ko", hello: "アンニョンハセヨ（안녕하세요）", thanks: "カムサハムニダ（감사합니다）", payment: "ほぼ完全キャッシュレス。交通カードが便利", bestSeason: "春（4〜6月）と秋（9〜11月）" },
  tw: { language: "中国語（繁体字）", langCode: "zh-TW", hello: "ニーハオ（你好）", thanks: "シエシエ（謝謝）", payment: "現金がまだ強い。悠遊カードが便利", bestSeason: "秋〜初冬（10〜12月）。夏は蒸し暑い" },
  th: { language: "タイ語", langCode: "th", hello: "サワディー（สวัสดี）", thanks: "コープクン（ขอบคุณ）", payment: "現金中心。屋台・市場は小額紙幣を", bestSeason: "乾季の11〜2月が過ごしやすい" },
  vn: { language: "ベトナム語", langCode: "vi", hello: "シンチャオ（Xin chào）", thanks: "カムオン（Cảm ơn）", payment: "現金中心。高額紙幣はお釣りに注意", bestSeason: "地域差大。北部は秋、南部は乾季（12〜4月）" },
  sg: { language: "英語・中国語など", langCode: "en", hello: "ハロー（Hello）", thanks: "サンキュー（Thank you）", payment: "キャッシュレスが進む。カード・QR決済が主流", bestSeason: "通年高温多湿。比較的乾いた2〜4月" },
  au: { language: "英語", langCode: "en", hello: "ハロー（Hello）", thanks: "サンキュー（Thank you）", payment: "ほぼキャッシュレス。タッチ決済が主流", bestSeason: "日本と季節が逆。春（9〜11月）と秋（3〜5月）" },
  ch: { language: "独・仏・伊語など", langCode: "de", hello: "グリュエッツィ（Grüezi）", thanks: "ダンケ（Danke）", payment: "カード広く使えるが現金も。物価が高い", bestSeason: "初夏〜秋（6〜9月）。登山は夏" },
  nl: { language: "オランダ語（英語も通じる）", langCode: "nl", hello: "ハロー（Hallo）", thanks: "ダンクユー（Dank u）", payment: "キャッシュレスが進む。カード必須", bestSeason: "春（4〜5月）のチューリップ期、初夏〜初秋" },
  tr: { language: "トルコ語", langCode: "tr", hello: "メルハバ（Merhaba）", thanks: "テシェキュレル（Teşekkürler）", payment: "現金中心。バザールは値切りが基本", bestSeason: "春（4〜5月）と秋（9〜11月）" },
  hk: { language: "広東語・英語", langCode: "zh-TW", hello: "ネイホウ（你好）", thanks: "ムゴイ（唔該）", payment: "オクトパスカードが万能。現金も用意", bestSeason: "秋〜初冬（10〜12月）" },
};

export const COUNTRY_INFO: Record<string, CountryInfo> = {
  fr: {
    name: "フランス",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/SEタイプ（変換プラグ必要）",
    tipping: "基本不要（サービス料込み）。満足なら端数〜数ユーロで十分",
    emergency: "112（EU共通）／警察17・救急15",
    water: "水道水は飲める",
    timeDiff: "-8時間（3〜10月の夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "スリ・置き引きに注意。日曜は閉まる店が多い。入店時は「ボンジュール」が基本マナー",
  },
  it: {
    name: "イタリア",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/F/Lタイプ（変換プラグ必要）",
    tipping: "基本不要。カフェ・レストランはコペルト（席料）が別途かかることあり",
    emergency: "112（EU共通）",
    water: "水道水は飲める",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "観光地はスリが非常に多い。教会は肌の露出NGの場所あり",
  },
  es: {
    name: "スペイン",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/Fタイプ（変換プラグ必要）",
    tipping: "基本不要。端数程度でOK",
    emergency: "112（EU共通）",
    water: "水道水は飲める",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "昼はシエスタで閉まる店あり。夕食は20〜22時と遅め。スリに注意",
  },
  de: {
    name: "ドイツ",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/Fタイプ（変換プラグ必要）",
    tipping: "合計の5〜10%程度を切り上げて渡す習慣",
    emergency: "112（救急）／110（警察）",
    water: "水道水は飲める",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "日曜はほぼ全店休み。現金もまだ強いので小額現金を用意",
  },
  gb: {
    name: "イギリス",
    currency: "ポンド（GBP / £）",
    plug: "230V・Gタイプ（3本角の変換プラグ必要）",
    tipping: "レストランで10〜12.5%（サービス料込みなら不要）",
    emergency: "999 または 112",
    water: "水道水は飲める",
    timeDiff: "-9時間（夏時間は-8時間）",
    visa: "6か月以内の観光は不要（ETA導入、事前申請要確認）",
    tips: "カードがほぼどこでも使える。パブは入口で注文・会計が基本",
  },
  us: {
    name: "アメリカ",
    currency: "USドル（USD / $）",
    plug: "120V・Aタイプ/Bタイプ",
    tipping: "ほぼ必須。レストラン15〜20%、タクシー・ホテルも慣習あり",
    emergency: "911",
    water: "水道水は飲める（地域差あり）",
    timeDiff: "-14〜-17時間（本土、夏時間で変動）",
    visa: "ESTA（電子渡航認証）の事前取得が必要",
    tips: "医療費が非常に高い。海外旅行保険は必須級。州で法律・税率が違う",
  },
  kr: {
    name: "韓国",
    currency: "ウォン（KRW / ₩）",
    plug: "220V・Cタイプ/SF（SEタイプ）",
    tipping: "不要",
    emergency: "112（警察）／119（救急・消防）",
    water: "水道水は飲用可だがミネラルウォーター推奨",
    timeDiff: "時差なし（±0）",
    visa: "90日以内の観光は不要（K-ETAの事前申請要確認）",
    tips: "交通カード（T-money）が便利。カード社会でほぼキャッシュレス",
  },
  tw: {
    name: "台湾",
    currency: "台湾ドル（TWD / 元）",
    plug: "110V・Aタイプ/Bタイプ",
    tipping: "不要",
    emergency: "110（警察）／119（救急）",
    water: "水道水は煮沸・ボトル推奨",
    timeDiff: "-1時間",
    visa: "90日以内の観光は不要",
    tips: "悠遊カード（EasyCard）が便利。夜市グルメが名物。コンビニが充実",
  },
  th: {
    name: "タイ",
    currency: "バーツ（THB / ฿）",
    plug: "220V・Aタイプ/B/Cタイプ",
    tipping: "習慣あり。20〜50バーツ程度",
    emergency: "191（警察）／1669（救急）／1155（ツーリストポリス）",
    water: "水道水は飲まない（ボトル水を）",
    timeDiff: "-2時間",
    visa: "30日以内の観光は不要（制度変更あり要確認）",
    tips: "寺院は肌の露出NG。王室への敬意に注意。屋台は火の通ったものを",
  },
  vn: {
    name: "ベトナム",
    currency: "ドン（VND / ₫）",
    plug: "220V・Aタイプ/Cタイプ",
    tipping: "任意。高級店では歓迎される",
    emergency: "113（警察）／115（救急）",
    water: "水道水は飲まない（ボトル水を）",
    timeDiff: "-2時間",
    visa: "45日以内の観光は不要（要最新確認）",
    tips: "バイクが多く横断注意。偽札・ぼったくりに注意。生ものは体調と相談",
  },
  sg: {
    name: "シンガポール",
    currency: "シンガポールドル（SGD / S$）",
    plug: "230V・Gタイプ（3本角の変換プラグ必要）",
    tipping: "不要（サービス料込み）",
    emergency: "999（警察）／995（救急）",
    water: "水道水は飲める",
    timeDiff: "-1時間",
    visa: "90日以内の観光は不要",
    tips: "ゴミのポイ捨て・ガム持込など罰金が厳しい。公共交通が清潔で便利",
  },
  au: {
    name: "オーストラリア",
    currency: "豪ドル（AUD / A$）",
    plug: "230V・Iタイプ（ハの字の変換プラグ必要）",
    tipping: "不要",
    emergency: "000",
    water: "水道水は飲める",
    timeDiff: "+1時間（シドニー等。夏時間で+2時間）",
    visa: "ETA（電子渡航認証）の事前取得が必要",
    tips: "日差しが強く日焼け対策必須。食品・自然物の持込検疫が厳しい",
  },
  ch: {
    name: "スイス",
    currency: "スイスフラン（CHF）",
    plug: "230V・Jタイプ（Cも使えることが多い）",
    tipping: "基本不要（サービス料込み）",
    emergency: "112／警察117・救急144",
    water: "水道水は飲める（街の噴水も飲用可が多い）",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "物価が非常に高い。鉄道が正確で便利。現金はフラン",
  },
  nl: {
    name: "オランダ",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/Fタイプ",
    tipping: "基本不要。5〜10%切り上げ程度",
    emergency: "112",
    water: "水道水は飲める",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "自転車優先。自転車レーンを歩かない。運河沿いは足元注意",
  },
  at: {
    name: "オーストリア",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/Fタイプ",
    tipping: "合計の5〜10%程度",
    emergency: "112／警察133・救急144",
    water: "水道水は飲める",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "カフェ文化が根付く。日曜休業の店が多い",
  },
  pt: {
    name: "ポルトガル",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/Fタイプ",
    tipping: "基本不要。端数程度",
    emergency: "112",
    water: "水道水は飲める",
    timeDiff: "-9時間（夏時間は-8時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "坂と石畳が多く歩きやすい靴を。エッグタルトが名物",
  },
  gr: {
    name: "ギリシャ",
    currency: "ユーロ（EUR / €）",
    plug: "230V・Cタイプ/Fタイプ",
    tipping: "5〜10%程度",
    emergency: "112",
    water: "本土は飲用可、島は煮沸・ボトル推奨",
    timeDiff: "-7時間（夏時間は-6時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "島はトイレに紙を流せないことが多い。日差し対策を",
  },
  tr: {
    name: "トルコ",
    currency: "トルコリラ（TRY / ₺）",
    plug: "230V・Cタイプ/Fタイプ",
    tipping: "レストランで5〜10%程度",
    emergency: "112",
    water: "水道水は飲まない（ボトル水を）",
    timeDiff: "-6時間",
    visa: "90日以内の観光は不要",
    tips: "モスクは肌の露出NG・女性はスカーフ。バザールは値切り交渉が基本",
  },
  ca: {
    name: "カナダ",
    currency: "カナダドル（CAD / C$）",
    plug: "120V・Aタイプ/Bタイプ",
    tipping: "ほぼ必須。レストラン15〜20%",
    emergency: "911",
    water: "水道水は飲める",
    timeDiff: "-13〜-17時間（都市・夏時間で変動）",
    visa: "eTA（電子渡航認証）の事前取得が必要",
    tips: "チップ前提の価格感。税が別途かかる。冬は本格防寒を",
  },
  hk: {
    name: "香港",
    currency: "香港ドル（HKD / HK$）",
    plug: "220V・Gタイプ（3本角の変換プラグ必要）",
    tipping: "任意。高級店はサービス料込み",
    emergency: "999",
    water: "水道水は煮沸・ボトル推奨",
    timeDiff: "-1時間",
    visa: "90日以内の観光は不要",
    tips: "オクトパスカードが便利。エスカレーターは右立ち",
  },
  cn: {
    name: "中国",
    currency: "人民元（CNY / 元）",
    plug: "220V・Aタイプ/Iタイプ/Cタイプ",
    tipping: "不要",
    emergency: "110（警察）／120（救急）",
    water: "水道水は飲まない（ボトル水・白湯を）",
    timeDiff: "-1時間",
    visa: "短期免除は条件付き。最新のビザ要否を必ず確認",
    tips: "決済はほぼスマホ（Alipay/WeChat）。Google・LINE等は使えずVPN事情に注意",
  },
  id: {
    name: "インドネシア（バリ等）",
    currency: "ルピア（IDR / Rp）",
    plug: "230V・Cタイプ/Fタイプ",
    tipping: "任意。高級店はサービス料込み",
    emergency: "110（警察）／118・119（救急）",
    water: "水道水は飲まない（ボトル水を）",
    timeDiff: "-1時間（バリ島）",
    visa: "到着ビザ（VOA）等が必要。最新制度を確認",
    tips: "寺院は腰布（サロン）着用。生水・氷に注意",
  },
  ph: {
    name: "フィリピン",
    currency: "ペソ（PHP / ₱）",
    plug: "220V・Aタイプ/Bタイプ/Cタイプ",
    tipping: "任意。10%程度",
    emergency: "911",
    water: "水道水は飲まない（ボトル水を）",
    timeDiff: "-1時間",
    visa: "30日以内の観光は不要",
    tips: "治安は地域差大。夜間の単独行動は避ける。離島は現金必須",
  },
  cz: {
    name: "チェコ",
    currency: "チェコ・コルナ（CZK / Kč）",
    plug: "230V・Cタイプ/Eタイプ",
    tipping: "合計の10%程度",
    emergency: "112",
    water: "水道水は飲める",
    timeDiff: "-8時間（夏時間は-7時間）",
    visa: "90日以内の観光は不要（ETIAS導入予定）",
    tips: "ユーロではなくコルナ。両替は街中のレート確認を。石畳に注意",
  },
  my: {
    name: "マレーシア",
    currency: "リンギット（MYR / RM）",
    plug: "240V・Gタイプ（3本角の変換プラグ必要）",
    tipping: "不要",
    emergency: "999",
    water: "水道水は煮沸・ボトル推奨",
    timeDiff: "-1時間",
    visa: "90日以内の観光は不要",
    tips: "イスラム圏でモスクは服装に配慮。多民族でグルメ豊富",
  },
  ae: {
    name: "アラブ首長国連邦（ドバイ等）",
    currency: "ディルハム（AED）",
    plug: "230V・Gタイプ（3本角の変換プラグ必要）",
    tipping: "任意。10%程度",
    emergency: "999（警察）／998（救急）",
    water: "水道水は飲めるが味でボトル推奨",
    timeDiff: "-5時間",
    visa: "30日以内の観光は不要",
    tips: "公共の場の服装・公共マナーに厳格。ラマダン期間は日中の飲食に配慮",
  },
  mx: {
    name: "メキシコ",
    currency: "メキシコペソ（MXN / $）",
    plug: "127V・Aタイプ/Bタイプ",
    tipping: "10〜15%程度",
    emergency: "911",
    water: "水道水は飲まない（ボトル水を）",
    timeDiff: "-14〜-16時間（都市・夏時間で変動）",
    visa: "180日以内の観光は不要",
    tips: "治安は地域差が大きい。夜間移動・流しのタクシーは避ける",
  },
  nz: {
    name: "ニュージーランド",
    currency: "NZドル（NZD / NZ$）",
    plug: "230V・Iタイプ（ハの字の変換プラグ必要）",
    tipping: "不要",
    emergency: "111",
    water: "水道水は飲める",
    timeDiff: "+3時間（夏時間は+4時間）",
    visa: "NZeTA（電子渡航認証）の事前取得が必要",
    tips: "紫外線が非常に強い。食品・自然物の持込検疫が厳しい",
  },
};

export function countryInfo(code: string | null | undefined): CountryInfo | null {
  if (!code) return null;
  const c = code.toLowerCase();
  const base = COUNTRY_INFO[c];
  if (!base) return null;
  return { ...base, ...(COUNTRY_EXTRA[c] ?? {}), phraseGroups: PHRASE_GROUPS[c] };
}
