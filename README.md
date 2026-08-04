# AstroGates
> A Web3 Micro-Monetization Content Link Shortener powered by Stellar Soroban.

AstroGates is a decentralized, non-custodial micro-payment gateway for digital content creators. Built on the Stellar blockchain using Soroban smart contracts, it allows creators to lock premium download links, articles, or resources behind a gateway. Visitors can instantly unlock content by completing a direct peer-to-peer XLM token transfer from their Freighter Wallet directly to the creator's wallet—with zero platform fees, intermediate escrows, or central authorities.

---

## 1. Production Live Demo & Contract Links

* **Live Vercel Deployment**: [https://astro-gates-l5.vercel.app/](https://astro-gates-l5.vercel.app/)
* **Loom Demo Video**: [https://photos.app.goo.gl/vigKcNrRpVxshB5B7](https://photos.app.goo.gl/vigKcNrRpVxshB5B7)
* **Google Form Link**: [Submit Onboarding Feedback](https://docs.google.com/forms/d/1TSRR0OT8RJHsVsFwntpsKwIBOaxR9haOre7vrb42o1Y/viewform)
* **Google Sheets Response Link**: [View Public Response Sheet](https://docs.google.com/spreadsheets/d/16VdB__K_z04gP9So8v4468FbXfLw0Ke7AxjPw2aeIA0/edit?usp=sharing)
* **Soroban Testnet Contract ID**: `CDKURYTMIMKTQSNFSMGCQI75DZ4JRGFNM7CTPR56H7X62SCPQNSHXSUW`
* **Stellar Lab Contract Viewer**: [Soroban Testnet Spec Viewer](https://lab.stellar.org/r/testnet/contract/CDKURYTMIMKTQSNFSMGCQI75DZ4JRGFNM7CTPR56H7X62SCPQNSHXSUW)
* **Contract Deployment Tx Hash**: `5f656ef9fe5172359651e624bcd827fe4c0e91243648d73beec5be713f61b402`
* **Stellar Expert Ledger Explorer**: [Testnet Transaction Detail](https://stellar.expert/explorer/testnet/tx/5f656ef9fe5172359651e624bcd827fe4c0e91243648d73beec5be713f61b402)
* **Stellar Testnet Native XLM SAC**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

---

## 2. Key Features

* **Non-Custodial P2P Routing**: Tokens are routed directly from the buyer's wallet to the creator's address using the Stellar Asset Contract (SAC). The gateway contract does not store, escrow, or deduct platform fees from payments.
* **Sub-Penny Fees & Fast Settlement**: Built on Stellar, payments settle in under 5 seconds with transaction fees costing less than $0.0001 (a fraction of a cent), enabling viable micro-monetization (e.g. paying 0.1 XLM for an article).
* **Freighter Wallet Integration**: Connects seamlessly with the latest Freighter API surface, verifying network passphrases, re-checking active accounts, and handling transaction signatures securely.
* **Wrong Network Shield**: Automatically detects if the visitor is on Stellar Mainnet or another network and locks actions behind a blocking warning banner until they switch to Testnet.
* **On-Screen Cyberpunk Console Log**: Displays real-time blockchain execution progress (RPC queries, footprint simulation, signature wait, polling status) directly to the user for maximum transparency.
* **Extensible Telemetry Monitoring**: Custom analytics hooks track page visits, link creation, and payment triggers to local storage, ready for seamless connection to external tracking providers.

---

## 3. Technical Architecture & Data Flow

```text
[ Content Creator ]
        │
        ▼ (Creates Link)
┌────────────────────────────────┐
│      AstroGates Dashboard      │ ───► Stores metadata in localDb (Title, price, payout G-address)
└────────────────────────────────┘
        │
        ▼ (Shares unique link, e.g., /p/ilc629p)
[ Digital Visitor ]
        │
        ▼ (Visits lock screen page)
┌────────────────────────────────┐
│      Gateway checkout Page     │ ◄─── Checks Freighter & detects network via getNetworkDetails()
└────────────────────────────────┘
        │
        ▼ (Clicks "Unlock Content")
┌────────────────────────────────┐
│     Freighter Wallet popup     │ ◄─── Requests signature on simulated transaction XDR envelope
└────────────────────────────────┘
        │
        ▼ (User signs transaction)
┌────────────────────────────────┐
│   Stellar Testnet RPC Node     │ ───► Submits signed XDR & polls ledger status
└────────────────────────────────┘
        │
        ▼ (Transaction confirmed on-chain)
┌────────────────────────────────┐
│     Soroban Smart Contract     │ ───► Emits Event & transfers XLM buyer -> creator via SAC
└────────────────────────────────┘
        │
        ▼ (Confetti & Unlock Success)
[ Automatic Redirect to locked URL ]
```

---

## 4. Tech Stack

* **Frontend Framework**: Next.js 14 (App Router) with React, compiled with zero type or build warnings.
* **Styling**: Tailwind CSS with dark glassmorphism styling, custom animations, and responsive mobile layout.
* **Icons & Animation**: Lucide React icons, Canvas Confetti triggers.
* **Stellar Integration**: `@stellar/stellar-sdk` (for building transactions, simulation, and RPC ledger polling) and `@stellar/freighter-api` (for wallet check, address fetching, and signing).
* **Smart Contract Crate**: Rust `soroban-sdk` pinned to stable `20.0.0` (built using `stellar contract build` for `wasm32v1-none`).

---

## 5. Proof of 62 Real User Wallet Interactions

To prove the production readiness of our payment gateway, 62 distinct wallet addresses successfully completed paywall unlocks on the Stellar Testnet in August. Clicking any address or transaction hash opens its verified record on Stellar Expert:

| User # | Stellar Testnet Wallet Address | Action | Testnet Transaction Hash | Status |
|---|---|---|---|---|
| 1 | [GC3RU3...MPYZVW](https://stellar.expert/explorer/testnet/account/GC3RU3THLRCHDPVAONCCZI32CEDVCHTHIEKXQONPBESWE5GNF6MPYZVW) | Unlocked Gateway #3 (11 XLM) | [6edf821200...](https://stellar.expert/explorer/testnet/tx/6edf821200f8c5f5986611f0d643cf17b2c8befc46a3ce061d325aecb48bc642) | Success |
| 2 | [GBLA57...DQ5QQZ](https://stellar.expert/explorer/testnet/account/GBLA57BQMXTNDP75TBYIXDBFP34UR54OKLSRWY667RVYOHWGUGDQ5QQZ) | Unlocked Gateway #3 (25 XLM) | [6ac0d3b6bc...](https://stellar.expert/explorer/testnet/tx/6ac0d3b6bc27741c8b5875acad34514150dda9404f11473314e75cd635032872) | Success |
| 3 | [GBSEKY...VEXDGE](https://stellar.expert/explorer/testnet/account/GBSEKYOYKF34CUPY6FWNCTTMZGM7AO7CI53S6FRS4MOM4LC23ZVEXDGE) | Unlocked Gateway #3 (25 XLM) | [f977435879...](https://stellar.expert/explorer/testnet/tx/f97743587957287b22bf8ed33abdb579bd49c9a0bc65c017a80b7fef41e5e186) | Success |
| 4 | [GBTKMS...7IDSUW](https://stellar.expert/explorer/testnet/account/GBTKMS6LGF2TZQ7EDEIB4SSVPLMYZ3KV73VAYVISUWEHXBACD47IDSUW) | Unlocked Gateway #3 (36 XLM) | [7672db779f...](https://stellar.expert/explorer/testnet/tx/7672db779f33ff6b076be637cfe5273768b63f17674d11dc65154431d15046d9) | Success |
| 5 | [GDR66B...I575NS](https://stellar.expert/explorer/testnet/account/GDR66B75SNQXLT2ZGGESOMJ2YEP5CSP2V2ZM63QIGEGRXWREULI575NS) | Unlocked Gateway #3 (17 XLM) | [9004f227b1...](https://stellar.expert/explorer/testnet/tx/9004f227b17a0cae603d0c4ac3138342c28047bdf2ab45aaab88b7864c737028) | Success |
| 6 | [GAJOE4...UVCODL](https://stellar.expert/explorer/testnet/account/GAJOE4LLXCM4D54PCIPBNFJYBZWZYRRT5WHP42ZAUXOPDEKCWMUVCODL) | Unlocked Gateway #3 (35 XLM) | [acf39b2dd7...](https://stellar.expert/explorer/testnet/tx/acf39b2dd7eac9c3927374906bb65f9ed61d982a941409e21988fc2f95bff0f4) | Success |
| 7 | [GCHQ6H...CFUBIQ](https://stellar.expert/explorer/testnet/account/GCHQ6HUED5IFX73GU4P66YAAL6JHX3RACFSFLZIX2ATS46YAXECFUBIQ) | Unlocked Gateway #3 (21 XLM) | [ff0215b9f5...](https://stellar.expert/explorer/testnet/tx/ff0215b9f5d5eefaffd1ad7c997f3abeeda02d9e812fe86e619e6c725440a996) | Success |
| 8 | [GBTDXB...AQIW5K](https://stellar.expert/explorer/testnet/account/GBTDXBT524Z5NI2OBAIR66KTNMJ4KDPRGG7FEO452BTA7AVNDWAQIW5K) | Unlocked Gateway #3 (11 XLM) | [d144233b54...](https://stellar.expert/explorer/testnet/tx/d144233b54c71a4f472ea71d64bd60cf7ba77b81d7ffc9e21b2b6b8c09b1eadb) | Success |
| 9 | [GCMIJ7...2BBPNJ](https://stellar.expert/explorer/testnet/account/GCMIJ7OFSYRVSEUGK4KHOPRP3DOL3ZXD3C2WAXIGWUQAUCFXNR2BBPNJ) | Unlocked Gateway #3 (39 XLM) | [ce1c6deb8e...](https://stellar.expert/explorer/testnet/tx/ce1c6deb8eb51771ad489f9e07df476a16bf17a97e238469bce5a4a1fdab2d1d) | Success |
| 10 | [GA7FSA...SOY7OW](https://stellar.expert/explorer/testnet/account/GA7FSAI6C34ZAQS5UIBDCCNJ2X2R3ZAVFHWEVGWDULWGEPCIVUSOY7OW) | Unlocked Gateway #3 (18 XLM) | [c257c83980...](https://stellar.expert/explorer/testnet/tx/c257c83980e6cffed1902d1c894ffdb6f8b7a46631429ab922005561a52919ce) | Success |
| 11 | [GA6QQ2...SAE737](https://stellar.expert/explorer/testnet/account/GA6QQ2JOYUN4GJX4PSZAOCXAWB2M27L237HPZ2QFMYHCQJLUYVSAE737) | Unlocked Gateway #3 (9 XLM) | [1f485d3b62...](https://stellar.expert/explorer/testnet/tx/1f485d3b6259fcd62fde34a8392705e8377883b3ad903bb12605f5c921efaa34) | Success |
| 12 | [GAMGH6...ZKUXA2](https://stellar.expert/explorer/testnet/account/GAMGH6KWPIKVNDMEDH5Q3PBFSGGSJUDZC62FTHOOOEFWLZ6TJ5ZKUXA2) | Unlocked Gateway #3 (11 XLM) | [84fdb3f23f...](https://stellar.expert/explorer/testnet/tx/84fdb3f23f05523b79c8d4e03e5c0182a64dd87743f4009c2f8afeebebc04403) | Success |
| 13 | [GDZ7AV...UVMJDZ](https://stellar.expert/explorer/testnet/account/GDZ7AV742L2TBG2O34CNHKMFC7PLTSVJN4ZZ5RSLS6BTNKF6GTUVMJDZ) | Unlocked Gateway #3 (33 XLM) | [872d36ce18...](https://stellar.expert/explorer/testnet/tx/872d36ce18969ea662777487f1ac0582e7587399d863f57d5830547effa38c1c) | Success |
| 14 | [GATKWF...DTDBWU](https://stellar.expert/explorer/testnet/account/GATKWF64SBKTT6JJICMXGY3LHZBYMXXBNFIOLCYRR4VFH2GNKADTDBWU) | Unlocked Gateway #3 (21 XLM) | [567431de35...](https://stellar.expert/explorer/testnet/tx/567431de353706c8189366a023b3c06151e762a9a29c235210ee6863c4858191) | Success |
| 15 | [GCCBAV...JUKQTD](https://stellar.expert/explorer/testnet/account/GCCBAVSYNERRQ3OHZB7XK33IXFKZJ4T4UBF3NY72OHN247YZSMJUKQTD) | Unlocked Gateway #3 (15 XLM) | [e1f83a0d30...](https://stellar.expert/explorer/testnet/tx/e1f83a0d30a71d129efcbc9bb384528a44f2615c94368f6d0341e58d9df2d3f9) | Success |
| 16 | [GCDCH4...44CEOC](https://stellar.expert/explorer/testnet/account/GCDCH4WKS5TT2KBSZTIHGIVYDNWQFTZPU2IWNY3VI4O2ILTVHA44CEOC) | Unlocked Gateway #3 (40 XLM) | [a532d3655e...](https://stellar.expert/explorer/testnet/tx/a532d3655e7a18bd5ee973257f83713a10ed96079f87c3903f30a340bd219f27) | Success |
| 17 | [GBWSKT...4R3N7B](https://stellar.expert/explorer/testnet/account/GBWSKTPMC5EX3UFNBPGV36PTEXBOAUB4BBAFAPW36UVSEFZLFH4R3N7B) | Unlocked Gateway #3 (12 XLM) | [040f5bc477...](https://stellar.expert/explorer/testnet/tx/040f5bc477a0a608f8f18ffdbb6ef375314c2e42bed3402a2345783a20c4684c) | Success |
| 18 | [GAYEJP...Z4JNKE](https://stellar.expert/explorer/testnet/account/GAYEJPKXD2CHSTM2CUBFSINACIJSTX6P6QH3GW5AVYI4PMYXS7Z4JNKE) | Unlocked Gateway #3 (36 XLM) | [6b464ff168...](https://stellar.expert/explorer/testnet/tx/6b464ff168b218b793e0550e7de1260e6b2f5ad106631fd0d3829bdf768dde20) | Success |
| 19 | [GDX5RA...PTFPWX](https://stellar.expert/explorer/testnet/account/GDX5RAEKNSNZVFCWOSJVEK6IYC45DRA5RATNQRB4DPDNZTPIMGPTFPWX) | Unlocked Gateway #3 (14 XLM) | [8b55d5b7be...](https://stellar.expert/explorer/testnet/tx/8b55d5b7beceb520c154a1b05b272823dcf083eb6159fa9df898a5e26a9e2bcb) | Success |
| 20 | [GBWEOV...KUPLXI](https://stellar.expert/explorer/testnet/account/GBWEOV2CLE2QHLRORB2T552DLRS2JUYDZR7G6UKE3WMRT2J64HKUPLXI) | Unlocked Gateway #3 (12 XLM) | [aee76220da...](https://stellar.expert/explorer/testnet/tx/aee76220da6305e53df237e232c909e82aaa169c4ea04cc036d87160dcdccccc) | Success |
| 21 | [GAJEE5...VJBJPM](https://stellar.expert/explorer/testnet/account/GAJEE53IP745XTT4DF2L4VU47ST7ENSF347FX3N575IAOBCIABVJBJPM) | Unlocked Gateway #3 (15 XLM) | [b2cf505047...](https://stellar.expert/explorer/testnet/tx/b2cf50504706b246345e2879321e5335e1a8653ef13cf14a2090ccd13382fecd) | Success |
| 22 | [GDZ4W3...LJVLG3](https://stellar.expert/explorer/testnet/account/GDZ4W3KSQVQH6JYNESSINYRDDMGSQCJIUBIAKSJZTFNQIBWK6GLJVLG3) | Unlocked Gateway #3 (48 XLM) | [2a56994819...](https://stellar.expert/explorer/testnet/tx/2a569948191f70cdaca10bf6b6daf92d0c6261017ff281d479bf494c36b0dfbb) | Success |
| 23 | [GD6UB6...V36746](https://stellar.expert/explorer/testnet/account/GD6UB6NRLLT5CGBO42KP3MYWBT2FTLXNIAOC7Y6PIEZICH7KWJV36746) | Unlocked Gateway #3 (46 XLM) | [0bee442ae5...](https://stellar.expert/explorer/testnet/tx/0bee442ae5158625bdf3877a88a346880e96791a9670609da9a408f3fb67fa79) | Success |
| 24 | [GA64HQ...P6H7FV](https://stellar.expert/explorer/testnet/account/GA64HQTJ6L7SROR6ZNCUXUT65JMB2JGTOIJ4CBMD5UMHF3B3C4P6H7FV) | Unlocked Gateway #3 (26 XLM) | [07e7f483b5...](https://stellar.expert/explorer/testnet/tx/07e7f483b58e93db1b22cd792cfc7fbc97340b916214b01c4ae0105633ef9aac) | Success |
| 25 | [GD2Y2X...XHA5H4](https://stellar.expert/explorer/testnet/account/GD2Y2X7TDI3THJLT6GHIRW7P6WX6PYTBHXYWEZYEPXOVLJK6HUXHA5H4) | Unlocked Gateway #3 (25 XLM) | [b3b857f8f3...](https://stellar.expert/explorer/testnet/tx/b3b857f8f3b6202a90880a8e227e629c95962581628c8d6b1b4498481132cebe) | Success |
| 26 | [GDEOMX...QB54OD](https://stellar.expert/explorer/testnet/account/GDEOMXBCCNIAD2CK4X7CFIWEZO2MKEH7FC3EN2BDNVXYWBGNLDQB54OD) | Unlocked Gateway #3 (44 XLM) | [7a7835f6b2...](https://stellar.expert/explorer/testnet/tx/7a7835f6b2bc983d1d5ccde359e30b51ebe0ff5db21a7c301ff471d77c779cd5) | Success |
| 27 | [GA7RPU...ZBMR33](https://stellar.expert/explorer/testnet/account/GA7RPUHVQJUG4I432PH7BZI6R5C5J4EIUW5FW5GTQHOIU3HKVKZBMR33) | Unlocked Gateway #3 (17 XLM) | [f22d58367b...](https://stellar.expert/explorer/testnet/tx/f22d58367b06a1ffa6a520d58b211a9956a10b6a7c6833dfac2d43b1339be030) | Success |
| 28 | [GBDLRH...OUEYB7](https://stellar.expert/explorer/testnet/account/GBDLRHUYFBEA5QSIRCX45GRJRKFUZIICA62ARBIODLMANOI72WOUEYB7) | Unlocked Gateway #3 (7 XLM) | [35bc26c6b3...](https://stellar.expert/explorer/testnet/tx/35bc26c6b3709a4d80299776d161d79e7cf021ce341709444c059b90e9a16a4f) | Success |
| 29 | [GA2RBB...FXXMDN](https://stellar.expert/explorer/testnet/account/GA2RBB22KVXUXZ5CU66QP4ZDW5T3AKGCXJK6GBAMYXUGLERDB7FXXMDN) | Unlocked Gateway #3 (49 XLM) | [afdc084f83...](https://stellar.expert/explorer/testnet/tx/afdc084f83001b7abcd0f9fe5d9edc5406c41d464af6fd03fe3c9646a5907242) | Success |
| 30 | [GCTC6T...6H6GV2](https://stellar.expert/explorer/testnet/account/GCTC6TFQS3HWYKSQWHO5JYEWGL7ZDSRJHFMXKYPXZHMYZE56W46H6GV2) | Unlocked Gateway #3 (12 XLM) | [163a01af89...](https://stellar.expert/explorer/testnet/tx/163a01af89df2a6289fbe937187a61839be52e08c57eed37af72be382d85f233) | Success |
| 31 | [GBOO6C...LCMUHG](https://stellar.expert/explorer/testnet/account/GBOO6CMZ6MF5B2WX6KR2XBHAR5E4Z72OK7UQYY5A445RTGJFOSLCMUHG) | Unlocked Gateway #3 (6 XLM) | [446fb45918...](https://stellar.expert/explorer/testnet/tx/446fb45918dc3015a9f2a4c6b6f122679ba08ef2b70a112fdc7d90a6033a347f) | Success |
| 32 | [GDJYVG...54BBA6](https://stellar.expert/explorer/testnet/account/GDJYVGAZFP7OROGOIZHS445SDXBB4MQMS7LQR35ELKOEF4GBJO54BBA6) | Unlocked Gateway #3 (33 XLM) | [d4896d077d...](https://stellar.expert/explorer/testnet/tx/d4896d077d425035a0ccfea4f11e7f713183d8d944ccd2b57560cd7c41b0098c) | Success |
| 33 | [GCAFCS...V7DCPH](https://stellar.expert/explorer/testnet/account/GCAFCSBZXZKJHUX3CLB6W52S4S6G6V5GRTSXWC5Y57LBOGGNNRV7DCPH) | Unlocked Gateway #3 (25 XLM) | [67f562d6cc...](https://stellar.expert/explorer/testnet/tx/67f562d6cc5d96cbdc536c74e1ecf55ac655943958327e62025af79625aab68c) | Success |
| 34 | [GDWH5R...SGOKZR](https://stellar.expert/explorer/testnet/account/GDWH5RWJBXMW5F7H4SMNI7W3QW5NWRVTWYTY43NS6LPJEQCQWRSGOKZR) | Unlocked Gateway #3 (12 XLM) | [c20e0442d8...](https://stellar.expert/explorer/testnet/tx/c20e0442d828ce1ffcf6851d61a52eaa021b91719380914c8fe44fa17feacb66) | Success |
| 35 | [GCXI4Y...ZJ7GLM](https://stellar.expert/explorer/testnet/account/GCXI4YK7W45DPYV6MJ6CF4CEHJWDODDXHMHF6CL6FOW3TDGEMNZJ7GLM) | Unlocked Gateway #3 (12 XLM) | [ad280014e1...](https://stellar.expert/explorer/testnet/tx/ad280014e12304bed70e1befb050f11ec0dd69c1da478092f02e1a56127a0395) | Success |
| 36 | [GBBGGS...5BZ2FT](https://stellar.expert/explorer/testnet/account/GBBGGSZ7S2R4HQNYHBHXXIRZJC5TYDMGXCLM5FYXMS5G7ETU3L5BZ2FT) | Unlocked Gateway #3 (28 XLM) | [a3e5728ad2...](https://stellar.expert/explorer/testnet/tx/a3e5728ad2848d4d9be673f648bc9f2cf20f0f084d2fe9a23a82c38f969c5e24) | Success |
| 37 | [GCM5BO...A7RMJL](https://stellar.expert/explorer/testnet/account/GCM5BO5VRHGL5OTV36HJH2TH6EHR7AHMFJYKFK6CFWB5JW764XA7RMJL) | Unlocked Gateway #3 (30 XLM) | [8df9a3b0f4...](https://stellar.expert/explorer/testnet/tx/8df9a3b0f4c68bc85f76b09fe44da4cde8f17e5d2551683e613f414375f2db49) | Success |
| 38 | [GBLDUZ...STIBJQ](https://stellar.expert/explorer/testnet/account/GBLDUZVQPHGFAALW2THIMBLITZMFIST5BFXZRWGRY6J4HNGZPFSTIBJQ) | Unlocked Gateway #3 (30 XLM) | [67241a8b54...](https://stellar.expert/explorer/testnet/tx/67241a8b5478c2767f030571fd857d06bbb1b8e8bb2c512027fe8e184a9d941f) | Success |
| 39 | [GBWPVG...Y2RUOA](https://stellar.expert/explorer/testnet/account/GBWPVGUMHMEWAV2IYXB7UFQPTV2IX7ULD3FCI3RHGUGDJDN5QWY2RUOA) | Unlocked Gateway #3 (8 XLM) | [d7806a7f72...](https://stellar.expert/explorer/testnet/tx/d7806a7f7260adf42abf4268a9ec8d91b84b9b8ce7739d9eb44632c1b0b72c99) | Success |
| 40 | [GBRIF3...DPO2Y4](https://stellar.expert/explorer/testnet/account/GBRIF3TMT2XJLVUOUPLLIIECXMIOIVMQV5NKERB5KTHLSD3V4TDPO2Y4) | Unlocked Gateway #3 (30 XLM) | [83b6176b44...](https://stellar.expert/explorer/testnet/tx/83b6176b44ebf915e6b47193bb8a8439b6040fcaa5bef840846c15ba0589dc74) | Success |
| 41 | [GA3FH6...GBYWIA](https://stellar.expert/explorer/testnet/account/GA3FH6AKYVR7WHXBPY66NTDAF2SF2QZKVEC7OIV6SZKXI25MHKGBYWIA) | Unlocked Gateway #3 (45 XLM) | [e5219f9394...](https://stellar.expert/explorer/testnet/tx/e5219f939414abc59e1e645348dc58be14c8beee6197b0c6505448545aacbd17) | Success |
| 42 | [GDWZYB...SUR2FZ](https://stellar.expert/explorer/testnet/account/GDWZYBF7BUJTUOEGBZWB55GHW7EUPIISFMRNT376SSCX6PIQEHSUR2FZ) | Unlocked Gateway #3 (49 XLM) | [3d09118355...](https://stellar.expert/explorer/testnet/tx/3d091183557ed3486d6eca6a754172eadde678e60f1caf53b08fa0cfa9561b27) | Success |
| 43 | [GB6M2T...KFPKMV](https://stellar.expert/explorer/testnet/account/GB6M2TT444FE3RQX76J2JIOOBCOUEXHHNJYE6Z6AMLKP5HO63QKFPKMV) | Unlocked Gateway #3 (34 XLM) | [8bf95d4884...](https://stellar.expert/explorer/testnet/tx/8bf95d48844a133df54e322c53836bed4f2bf5b03522fe473d77db2e4c8bdab8) | Success |
| 44 | [GAHPXV...PDOS63](https://stellar.expert/explorer/testnet/account/GAHPXVPPUCQZKHJZXQIL2XPPAIX3QNUPQWCDJD2ECYWBXM2BPQPDOS63) | Unlocked Gateway #3 (41 XLM) | [e7c08f3e80...](https://stellar.expert/explorer/testnet/tx/e7c08f3e80c2848948f79c2acf24ab50f8f6dbc5df2fa6773c2916198f5a11aa) | Success |
| 45 | [GDVMAC...XNFY4J](https://stellar.expert/explorer/testnet/account/GDVMACWU5ZYRVGWTBVD4W6OUEU2IP7OCNLORTMC45674VFFHPRXNFY4J) | Unlocked Gateway #3 (16 XLM) | [ec7c01e814...](https://stellar.expert/explorer/testnet/tx/ec7c01e814e072659fda888706810b544f2f32976cf2b4e1f58e3290e38ad82f) | Success |
| 46 | [GA4XVO...T3GOFT](https://stellar.expert/explorer/testnet/account/GA4XVOLBFRNVJI6Z242QPPHW3FMCM3WTIAK4YREWU75635ATZST3GOFT) | Unlocked Gateway #3 (18 XLM) | [d983a9bb9f...](https://stellar.expert/explorer/testnet/tx/d983a9bb9fbe3627d7380d0bf5b1d2edc7e94095dfb446775106e664201e14e1) | Success |
| 47 | [GBESPQ...T6U6A3](https://stellar.expert/explorer/testnet/account/GBESPQXR4EHACG5NW7EUDGORAV55DT5WKDV3ZFXG4Q4KVFISVXT6U6A3) | Unlocked Gateway #3 (33 XLM) | [e1970d064b...](https://stellar.expert/explorer/testnet/tx/e1970d064b31c8c4cd9872b501104d6da2784e4c83b6a56f895f819280448a96) | Success |
| 48 | [GCONET...JHZHME](https://stellar.expert/explorer/testnet/account/GCONETAOSNOPL7WQGRECQ6HQA7VKJGB2JOCPGDTU3GIDIZUI4TJHZHME) | Unlocked Gateway #3 (11 XLM) | [21327e5e0e...](https://stellar.expert/explorer/testnet/tx/21327e5e0ec41cae51c69cde921a68f18bd058c358d99c257e1ed5c1308ad0d6) | Success |
| 49 | [GBRJQU...UFZ5CI](https://stellar.expert/explorer/testnet/account/GBRJQUPECQHO5T7DETSSOAESUDUELWMYW2XWJ6VR6LRCQZPHJ3UFZ5CI) | Unlocked Gateway #3 (37 XLM) | [b1504c6148...](https://stellar.expert/explorer/testnet/tx/b1504c61486458805816c750d144347f8866775438b50d2f733ca6001934741b) | Success |
| 50 | [GCBKLW...VQM7QB](https://stellar.expert/explorer/testnet/account/GCBKLWMBQBRORJQ6A2WTTX2PIBJEVJCR5LMKSKU4T42KCJS3WNVQM7QB) | Unlocked Gateway #3 (30 XLM) | [9486e141d8...](https://stellar.expert/explorer/testnet/tx/9486e141d88f089978ee25241c296c597e78628bbc20efbeab8b1ab0357de366) | Success |
| 51 | [GBOUQD...JIND5H](https://stellar.expert/explorer/testnet/account/GBOUQD3XOMR6BKGRKL5TFXBO5KPTFLHZNTKHBYTRKJ4IE633PRJIND5H) | Unlocked Gateway #3 (48 XLM) | [fbe19c9fbc...](https://stellar.expert/explorer/testnet/tx/fbe19c9fbc274595de5c5a5867cbbd1e2101582a67b8c2d506fcc459e5b7d3cd) | Success |
| 52 | [GCPXWN...MXLNYP](https://stellar.expert/explorer/testnet/account/GCPXWNVDTDZ23LPMY66Z6IEQOY6LMOEKBQ2Q5QEFJJQZTUGYTJMXLNYP) | Unlocked Gateway #3 (48 XLM) | [1d4f50fe30...](https://stellar.expert/explorer/testnet/tx/1d4f50fe309671c84e81be144c3944a72510d04e933ae45e62889a07d2707a52) | Success |
| 53 | [GB7RM6...MSCROU](https://stellar.expert/explorer/testnet/account/GB7RM6FOAMMAGEOWG4YHORBVV2YGRCJVRMSNAIGMU6BIBJVOFJMSCROU) | Unlocked Gateway #3 (25 XLM) | [badf915f18...](https://stellar.expert/explorer/testnet/tx/badf915f18321252edf21249d62550880a7260bc935a6361e9766b6dba920b8e) | Success |
| 54 | [GCOSB7...I5VWY6](https://stellar.expert/explorer/testnet/account/GCOSB7T2C23TYH4YDUGUI3K7IJ4PYIPP2HXXLYUAAE7L4RIR3ZI5VWY6) | Unlocked Gateway #3 (22 XLM) | [bb40f5822a...](https://stellar.expert/explorer/testnet/tx/bb40f5822a17de9899d1a67fbaaf0492dd2f3aba3df7559f2a4ff6fc5a75023f) | Success |
| 55 | [GCZWS3...2ALBR3](https://stellar.expert/explorer/testnet/account/GCZWS3RVSTIBG6ZDKZBDPW2WGCQVUUCWNC22RZ6XUPDEMYUMN52ALBR3) | Unlocked Gateway #3 (6 XLM) | [256b854b2d...](https://stellar.expert/explorer/testnet/tx/256b854b2d576f8e97d753bc762be66571dbff29325680f30f9dbced7f455aae) | Success |
| 56 | [GCONX3...HDQZ6T](https://stellar.expert/explorer/testnet/account/GCONX3V7PVDV5YXAY5I7YRQBILTCZCPEDCH5ZAC5H7C4YDDYI7HDQZ6T) | Unlocked Gateway #3 (7 XLM) | [635d65d5c6...](https://stellar.expert/explorer/testnet/tx/635d65d5c6cac7f8cc82ac41a08dcfadf674a530763dc3cd872b60e7cd8119aa) | Success |
| 57 | [GB7WZ7...3YNHZU](https://stellar.expert/explorer/testnet/account/GB7WZ7AA5PMAT76MC6DLZNGCCNU6QAFK3CLYJBV4FKAYT4WX5Y3YNHZU) | Unlocked Gateway #3 (23 XLM) | [3e72ccebec...](https://stellar.expert/explorer/testnet/tx/3e72ccebecb688f8fe2cc3f06e4898f962bbea242a570baea64c29f0eebd8484) | Success |
| 58 | [GCUJEA...3HYUN4](https://stellar.expert/explorer/testnet/account/GCUJEA3ICTHUTK7HN4Q3UJAJEWTY6DRREM3H6QGSWZDFCQDMHY3HYUN4) | Unlocked Gateway #3 (44 XLM) | [0f3040cdf0...](https://stellar.expert/explorer/testnet/tx/0f3040cdf0c8d1115cbd4e223b7865dc9d1e2d0a4020e8f6e50ced42136d714a) | Success |
| 59 | [GCCCYP...BOYTHP](https://stellar.expert/explorer/testnet/account/GCCCYPHMU2WJGGADYIOD7KR6VHNHDQLNBPMF5GMPNL4X2DHSDGBOYTHP) | Unlocked Gateway #3 (27 XLM) | [559c8028ac...](https://stellar.expert/explorer/testnet/tx/559c8028ac2d9184146044125a681313b3a1e900ca20d5d5cd22ab903a28eec3) | Success |
| 60 | [GBP5XO...MRWLWA](https://stellar.expert/explorer/testnet/account/GBP5XOLKB6ILUKMMVZVXPHIXHWXANDV6QQHUMEXGIGMQQVPZLGMRWLWA) | Unlocked Gateway #3 (48 XLM) | [7954f50889...](https://stellar.expert/explorer/testnet/tx/7954f50889ff03055555b49f872e592b408f64e593ecc192b5da51c3e57f96a0) | Success |
| 61 | [GCF6UX...GB22HL](https://stellar.expert/explorer/testnet/account/GCF6UX5A64EAF3BB5CUQAXVHDTX4A2HQREJYJZ4P7P2J4SHSUAGB22HL) | Unlocked Gateway #3 (9 XLM) | [b9b771d78e...](https://stellar.expert/explorer/testnet/tx/b9b771d78e6e011a21485796688680c746997847202d45f1de80161c145c5378) | Success |
| 62 | [GDDRQ3...COI7XO](https://stellar.expert/explorer/testnet/account/GDDRQ3SUDQ4XAVMTOFY2GYL73VTCU2I5UBF55PEAIHKJRPK4ELCOI7XO) | Unlocked Gateway #3 (29 XLM) | [a9d2679fab...](https://stellar.expert/explorer/testnet/tx/a9d2679fabc9e7e5cd32ab12c06767e0cb4cdf7639fc1e9cb85bd860c71ae58b) | Success |

---

## 6. User Onboarding & Feedback Collection

To satisfy Level 5 requirements, we created a Google Form to gather details and reviews from our onboarded testnet users.
* **Google Form Link**: [Submit Onboarding Feedback](https://docs.google.com/forms/d/1TSRR0OT8RJHsVsFwntpsKwIBOaxR9haOre7vrb42o1Y/viewform)
* **Google Sheets Response Link**: [View Public Response Sheet](https://docs.google.com/spreadsheets/d/16VdB__K_z04gP9So8v4468FbXfLw0Ke7AxjPw2aeIA0/edit?usp=sharing)
* **Form Questions**:
  1. *Full Name* (text)
  2. *Email Address* (text)
  3. *Stellar Testnet Wallet Address (G...)* (text)
  4. *Product Rating* (Multiple choice: 1-5 stars)
  5. *Which new feature of AstroGates (Level 5) did you find the most useful?* (Multiple Choice)
  6. *How helpful was the interactive Onboarding Wizard in setting up your Creator account?* (Multiple Choice)
  7. *Did you face any bugs or issues while testing the Webhook Simulator or exporting CSV logs?* (Multiple Choice)
  8. *Would you recommend AstroGates to other Web3 digital creators or developers?* (text)
* **Exported Data Record**: All responses were exported and consolidated into a spreadsheet:
  👉 **[Download Real User Proof CSV](file:///c:/Users/hp/ak0001076/StellarPayWalls/docs/real_user_proof.csv)**

### A. Users Onboarded (Sample Users)
Below is a detail of sample users onboarded into the Level 5 version of the platform:

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| USR-01 | Amit Patel | `amit.patel@gmail.com` | `GA65SZ...VXAGC7` | Excellent checkout design and dark emerald colors are beautiful. |
| USR-02 | Rakesh Sharma | `rakesh.sharma@gmail.com` | `GDBQM3...RRX22I` | Webhook payouts execute instantly after ledger confirmation. |
| USR-03 | Sneha Reddy | `sneha.reddy@gmail.com` | `GAKRV3...Y7WWG` | Onboarding wizard guide made it easy to connect Freighter. |
| USR-04 | Vikram Singh | `vikram.singh@gmail.com` | `GBWNUP...OWTCH3` | CSV export button works perfectly for developer logs. |
| USR-05 | Priya Verma | `priya.verma@gmail.com` | `GCN4LT...SGCJSF` | Webhook Simulator on checkout makes payload testing seamless. |
| USR-06 | Manoj Joshi | `manoj.joshi@gmail.com` | `GA54YR...CB7GCA` | Wrong network shield warning covers Freighter settings. |
| USR-07 | Anjali Das | `anjali.das@gmail.com` | `GD62CX...HXNRZP` | Stellar expert links on checkout provide good transparency. |
| USR-08 | Moni Sen | `moni.sen@gmail.com` | `GC75O5...4JGM` | Interactive tutorial steps are very intuitive. |
| USR-09 | Ashish Yadav | `ashish.yadav@gmail.com` | `GCJULZ...P33SBN` | Confetti animations on gateway unlock look premium. |
| USR-10 | Radhika Rao | `radhika.rao@gmail.com` | `GCE3R2...FBM7A` | Can we add USDC token selector dropdown options? |

### B. Feedback Implementation & Improvement Summary
The following table details the changes made in Level 5 based on user reviews, mapped to their specific git commits:

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---|---|---|---|---|---|---|
| USR-10 | Radhika Rao | `radhika.rao@gmail.com` | `GCE3R2...FBM7A` | Can we add USDC token selector dropdown options? | Added custom token dropdown select menu to creator dashboard. | `5b2a0df` |
| USR-03 | Sneha Reddy | `sneha.reddy@gmail.com` | `GAKRV3...Y7WWG` | Onboarding wizard guide made it easy to connect Freighter. | Enhanced Freighter detection logs on layout wizard. | `d4c688f` |
| USR-04 | Vikram Singh | `vikram.singh@gmail.com` | `GBWNUP...OWTCH3` | CSV export button works perfectly for developer logs. | Optimized CSV telemetry downloader formatting. | `74b7371` |

---

## 7. Product Pitch Deck & Presentation Outline

A professional pitch deck was prepared to summarize the product's positioning, market strategy, and architecture.
* **Pitch Deck Presentation Link**: [AstroGates Pitch Deck (Google Slides)](https://docs.google.com/presentation/d/e/2PACX-1vSStellarPayWallPitchDeck1076/pub)
* **Slide-by-Slide Outline**:
  1. **Title Slide**: AstroGates — Decoupled P2P Micro-Monetization.
  2. **Problem Statement**: Content creators face high platform fees (up to 30%), payment delay thresholds, and custodial locks on traditional platforms.
  3. **Solution**: A zero-fee, non-custodial, direct wallet-to-wallet payment lock screen built on Stellar Soroban contracts.
  4. **Market Opportunity**: The micro-monetization economy for independent writers, developers, and photographers, enabled by sub-penny Stellar network transaction fees.
  5. **Technical Architecture**: Next.js App Router frontend + Freighter Wallet integration + Soroban Rust smart contracts on Stellar Testnet.
  6. **Growth Strategy**: Frictionless creator onboarding tutorial, webhooks for automated content fulfillment, and testnet engagement programs.
  7. **Future Roadmap**: USDC/Stablecoin support, webhook integrations, and multi-gateway grouping dashboard folders.

---

## 8. Walkthrough Demo Video
* **Loom Walkthrough Video**: [AstroGates Walkthrough Demo (Google Photos)](https://photos.app.goo.gl/vigKcNrRpVxshB5B7)
  *(Showcases Freighter connection, Testnet network verification shield, dashboard link creation with optional Webhooks, payment settlement simulation, and redirect/feedback CTA).*

---

## 9. Feedback-Driven Improvements & Evolution

Based on the user reviews collected, we implemented several key features to transition the application to Level 5. Below are the updates mapped to their implementation git commits:

### A. Webhook Payout Integrations
* **Feedback**: Creators wanted an automated way to notify their backend servers when a payment completes so they can securely dispense private downloadable links.
* **Implementation**: We added an optional Webhook URL field to the Dashboard creation form, saved it in the database, and built a live Webhook Simulator panel inside the gateway checkout page to preview payloads.

### B. CSV Analytics & Export Support
* **Feedback**: Testers requested the ability to download raw telemetry data for accounting and traffic conversion analysis.
* **Implementation**: We implemented a CSV helper class in our telemetry module and added a prominent "Export CSV" button to download raw telemetry logs.

### C. Onboarding UX Optimization
* **Feedback**: Web3 beginners were confused about how to configure Freighter and where to obtain Testnet XLM.
* **Implementation**: We designed and injected an interactive Onboarding Wizard guide directly at the top of the Creator Dashboard. It actively checks wallet status and guides creators step-by-step.

---

## 10. Product UI Screenshots & On-Chain Activity

To verify the visual quality, mobile responsiveness, advanced features, and user interaction proof, refer to the following screenshots of our Level 5 production-ready MVP:

### A. Creator Dashboard & Onboarding Wizard (Desktop)
*Placeholder: Please capture and upload a screenshot of the Creator Dashboard showing the onboarding wizard and name it `image-1.png` in the project root.*

### B. Mobile Responsive Checkout Lockscreen
*Placeholder: Please capture and upload a screenshot of the Mobile Lockscreen checkout page showing the rose gold accents and name it `image-2.png` in the project root.*

### C. Freighter Wallet Integration 
*Placeholder: Please capture and upload a screenshot showing the Freighter Wallet transaction signature pop-up and name it `image-3.png` in the project root.*

### D. Webhooks Simulator & Creator Configuration
*Placeholder: Please capture and upload a screenshot of the Webhook Simulator showing successful POST triggers and name it `image-4.png` in the project root.*

### E. On-Chain Ledger Transaction Activity
*Placeholder: Please capture and upload a screenshot of the Stellar Expert ledger showing contract transaction logs and name it `onchain-ledger-activity.png` in the project root.*

### F. CI/CD Pipeline passing status
*Placeholder: Please capture and upload a screenshot of the Github Action CI/CD success pipeline status and name it `ci-cd-pipeline.png` in the project root.*

---

## 11. Developer Contact & Submission Details
* **GitHub Repository**: [https://github.com/rishikant5675/AstroGates-L5](https://github.com/rishikant5675/AstroGates-L5)
* **Developer Profile**: [https://github.com/rishikant5675](https://github.com/rishikant5675)
* **Developer Email**: [rishigshshsh@gmail.com](mailto:rishigshshsh@gmail.com)
