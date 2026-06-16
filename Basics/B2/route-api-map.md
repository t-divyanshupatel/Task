# Route & API Map Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-route-api-mapper |
| **Started at** | 2026-06-16T08:45:22.584Z |
| **Completed at** | 2026-06-16T08:45:22.593Z |
| **Duration** | 1s |
| **Repository** | /Users/divyanshupatel/Desktop/mf/mf-h5 |
| **Repo name** | mf-h5 (rne-frontend) |
| **Stack detected** | React 18 + React Router 6 + Webpack 5 + TanStack React Query 4 + Axios |
| **Base URL / prefix** | https://mf-h5.paytmmoney.com (production); PRE_IR_ROOT=/pre-ir-report |
| **Files scanned** | 1756 |
| **Routes found** | 79 wired (+ 4 defined but unwired) |
| **API endpoints found** | 150 |

## Summary

mf-h5 is a React 18 mobile-web mutual fund investing app embedded in Paytm Money native webviews and mini-app containers. Routing is centralized in `src/routes/routes.js` (path constants) and wired in `src/routes/index.js` with 70+ lazy-loaded screens via React Router v6. API calls are centralized in `src/config/urlConfig.js` (33 export groups) with host prefixes from `src/config/envConfig.js`. Major flows: discover/home, portfolio & analysis, buy/sell/modify order pad, SIP management, bank change, fund switch, Pre-IR report, Finvu consent, and cart checkout. Four route constants are defined but not registered in the router.

## Frontend Routes

| # | Path | Name / Key | Screen / Component | Auth | Source | Notes |
|---|------|------------|-------------------|------|--------|-------|
| 1 | / | BLANK_ROUTE | InitialNavigation | unknown | src/routes/index.js:185 | — |
| 2 | /payment-options | PAYMENT_OPTIONS | PaymentOptions | unknown | src/routes/index.js:196 | — |
| 3 | /auto-pay | AUTO_PAY | AutoPay | unknown | src/routes/index.js:197 | — |
| 4 | /partner-banks | PARTNER_BANKS | PartnerBanks | unknown | src/routes/index.js:198 | — |
| 5 | /monthly-sip-card | MONTHLY_SIP_CARD | MonthlySipCard | unknown | src/routes/index.js:199 | — |
| 6 | /watchlist/edit | EDIT_WATCHLIST | EditWatchlist | unknown | src/routes/index.js:200 | — |
| 7 | /nfo | NEW_FUND_OFFERS | NewFundOffers | unknown | src/routes/index.js:202 | — |
| 8 | /featured-by-amcs | FEATURED_AMCS | FeaturedAMC | unknown | src/routes/index.js:216 | — |
| 9 | /pg-redirection | PG_REDIRECTION | PgRedirection | unknown | src/routes/index.js:230 | — |
| 10 | /pg-redirection-payment-option | PG_REDIRECTION_PAYMENT_OPTION | PgRedirectionPaymentOption | unknown | src/routes/index.js:238 | — |
| 11 | /home | DISCOVER | Discover | unknown | src/routes/index.js:246 | — |
| 12 | /portfolio | PORTFOLIO | Portfolio | unknown | src/routes/index.js:254 | — |
| 13 | /monthly-sip-onboarding | MONTHLY_SIP | MonthlySipOnboarding | unknown | src/routes/index.js:262 | — |
| 14 | /portfolio/analysis | ANALYSIS | PortfolioAnalysis | unknown | src/routes/index.js:270 | — |
| 15 | /portfolio/schemes/:isin | ISIN | PortfolioSchemeISIN | unknown | src/routes/index.js:278 | — |
| 16 | /portfolio/analysis/insights | INSIGHTS | PortfolioInsights | unknown | src/routes/index.js:286 | — |
| 17 | /portfolio/analysis/allocation | ALLOCATION | PortfolioAllocation | unknown | src/routes/index.js:294 | — |
| 18 | /watchlist | WATCHLIST | WatchList | unknown | src/routes/index.js:302 | — |
| 19 | /top-up | TOP_UP | TopUp | unknown | src/routes/index.js:310 | — |
| 20 | /funds-compare | FUNDS_COMPARE | FundsCompare | unknown | src/routes/index.js:318 | — |
| 21 | /search | SEARCH | Search | unknown | src/routes/index.js:326 | — |
| 22 | /fund-collections | FUND_COLLECTION | FundCollection | unknown | src/routes/index.js:334 | — |
| 23 | /listing-with-description | LISTING_WITH_DESCRIPTION | ListingWithDescription | unknown | src/routes/index.js:342 | — |
| 24 | /fund-category | FUND_CATEGORIES | FundCategories | unknown | src/routes/index.js:350 | — |
| 25 | /export-mf | EXPORT_MF | ExportMF | unknown | src/routes/index.js:358 | — |
| 26 | /most-bought-mf | MOST_BOUGHT_MF | MostBoughtMF | unknown | src/routes/index.js:366 | — |
| 27 | /listing-with-sub-category | FUNDS_WITH_HIGH_RETURNS | FundsWithHighReturns | unknown | src/routes/index.js:374 | — |
| 28 | /home/fund-managers | FUND_MANAGERS | FundManagers | unknown | src/routes/index.js:382 | — |
| 29 | /search/results | SEARCH_RESULTS | SearchResults | unknown | src/routes/index.js:390 | — |
| 30 | /my-sips | MY_SIPS | MySips | unknown | src/routes/index.js:398 | — |
| 31 | /my-sips/sip-details/:sipId | SIP_DETAILS | SipDetails | unknown | src/routes/index.js:406 | — |
| 32 | /cancel-sip | CANCEL_SIP | CancelSip | unknown | src/routes/index.js:422 | — |
| 33 | /confirm-cancel-sip | CONFIRM_CANCEL_SIP | ConfirmCancelSipPage | unknown | src/routes/index.js:430 | — |
| 34 | /quick-sip | QUICK_SIP | QuickSip | unknown | src/routes/index.js:438 | — |
| 35 | /buy-order-pad | BUY_ORDER_PAD | BuyOrderPadTab | unknown | src/routes/index.js:446 | — |
| 36 | /sell-order-pad | SELL_ORDER_PAD | SellOrderPadTab | unknown | src/routes/index.js:454 | — |
| 37 | /modify-buy-order-pad | MODIFY_BUY_ORDER_PAD | ModifyOrderPad | unknown | src/routes/index.js:462 | — |
| 38 | /restart-buy-order-pad | RESTART_BUY_ORDER_PAD | RestartOrderPad | unknown | src/routes/index.js:470 | — |
| 39 | /pending-investment | PENDING_INVESTMENT | PendingInvestment | unknown | src/routes/index.js:478 | — |
| 40 | /withdraw-funds | WITHDRAW_FUNDS | WithdrawFunds | unknown | src/routes/index.js:487 | — |
| 41 | /cross-sell-equity | CROSS_SELL_EQUITY | CrossSellEquity | unknown | src/routes/index.js:495 | — |
| 42 | /change-bank | CHANGE_BANK | ChangeBank | unknown | src/routes/index.js:503 | — |
| 43 | /withdraw-funds/status | WITHDRAW_FUNDS_STATUS | WithDrawStatus | unknown | src/routes/index.js:511 | — |
| 44 | /fund-basket | FUND_BASKET | FundBasket | unknown | src/routes/index.js:519 | — |
| 45 | /jio-nfo | JIO_NFO | JioNfo | unknown | src/routes/index.js:527 | — |
| 46 | /change-bank/upload-bank-documents | UPLOAD_BANK_DOCUMENTS | UploadBankDocuments | unknown | src/routes/index.js:535 | — |
| 47 | /change-bank/your-bank-accounts | YOUR_BANK_ACCOUNTS | YourBankAccounts | unknown | src/routes/index.js:543 | — |
| 48 | /change-bank/folio-bank-accounts | FOLIO_BANK_ACCOUNTS | FolioBankAccounts | unknown | src/routes/index.js:551 | — |
| 49 | /change-bank/bank-change-status | BANK_CHANGE_STATUS | BankChangeStatus | unknown | src/routes/index.js:559 | — |
| 50 | /change-bank/upload-bank-documents/signature | SIGNATURE | Signature | unknown | src/routes/index.js:567 | — |
| 51 | /fund-basket-details | FUND_BASKET_DETAILS | FundBasketDetails | unknown | src/routes/index.js:575 | — |
| 52 | /pre-ir-report | `${PRE_IR.ROOT}${PRE_IR.HOME}` | PreIr.Home | unknown | src/routes/index.js:587 | — |
| 53 | /pre-ir-report/onboarding | `${PRE_IR.ROOT}${PRE_IR.ONBOARDING}` | PreIr.Onboarding | unknown | src/routes/index.js:595 | — |
| 54 | /pre-ir-report/home | `${PRE_IR.ROOT}${PRE_IR.DISCOVER}` | PreIr.Discover | unknown | src/routes/index.js:603 | — |
| 55 | /pre-ir-report/portfolio | `${PRE_IR.ROOT}${PRE_IR.PORTFOLIO}` | PreIr.Portfolio | unknown | src/routes/index.js:611 | — |
| 56 | /pre-ir-report/portfolio-details/:isin | `${PRE_IR.ROOT}${PRE_IR.PORTFOLIO_DETAILS}` | PreIr.PortfolioDetails | unknown | src/routes/index.js:619 | — |
| 57 | /scheme-details | SCHEME_DETAILS | SchemeDetails | unknown | src/routes/index.js:629 | — |
| 58 | /sip-widget | SIP_WIDGET | SipCard | unknown | src/routes/index.js:637 | — |
| 59 | /contextual-home | CONTEXTUAL_HOME | ContextualHome | unknown | src/routes/index.js:645 | — |
| 60 | /popular-funds | POPULAR_FUNDS | PopularFunds | unknown | src/routes/index.js:653 | — |
| 61 | /cart-order-checkout | CART_ORDER_CHECKOUT | CartOrderCheckout | unknown | src/routes/index.js:661 | — |
| 62 | /switch-funds | SWITCH_FUNDS.ROOT | unknown | unknown | src/routes/index.js:669 | — |
| 63 | /switch-funds/fund-selection | SWITCH_FUNDS_ROUTES.FUND_SELECTION() | SwitchFunds.FundSelection | unknown | src/routes/index.js:673 | — |
| 64 | /switch-funds/bulk-switch | SWITCH_FUNDS_ROUTES.BULK_SWITCH() | SwitchFunds BulkSwitch | unknown | src/routes/index.js:681 | — |
| 65 | /switch-funds/bulk-switch/overview | SWITCH_FUNDS_ROUTES.OVERVIEW() | SwitchFunds.Overview | unknown | src/routes/index.js:693 | — |
| 66 | /switch-funds/benefits | SWITCH_FUNDS_ROUTES.BENEFITS() | SwitchFunds.Benefits | unknown | src/routes/index.js:703 | — |
| 67 | /switch-funds/update-amount | SWITCH_FUNDS_ROUTES.UPDATE_AMOUNT() | SwitchFunds.UpdateAmount | unknown | src/routes/index.js:711 | — |
| 68 | /switch-funds/folio | SWITCH_FUNDS_ROUTES.FOLIO() | SwitchFunds.Folio | unknown | src/routes/index.js:719 | — |
| 69 | /switch-funds/status | SWITCH_FUNDS_ROUTES.STATUS() | SwitchFunds.Status | unknown | src/routes/index.js:727 | — |
| 70 | /switch-funds/error | SWITCH_FUNDS_ROUTES.ERROR() | SwitchFunds.Error | unknown | src/routes/index.js:735 | — |
| 71 | /finvu | FINVU.ROOT | unknown | unknown | src/routes/index.js:745 | — |
| 72 | /finvu/home | FINVU_ROUTES.HOME() | Finvu.Home | unknown | src/routes/index.js:749 | — |
| 73 | /finvu/request | FINVU_ROUTES.REQUEST() | Finvu.Request | unknown | src/routes/index.js:757 | — |
| 74 | /finvu/upload-details | FINVU_ROUTES.UPLOAD_DETAILS() | Finvu.UploadDetails | unknown | src/routes/index.js:765 | — |
| 75 | /finvu/fetch-status | FINVU_ROUTES.FETCH_STATUS() | Finvu.FetchStatus | unknown | src/routes/index.js:773 | — |
| 76 | /finvu/status | FINVU_ROUTES.STATUS() | Finvu.Status | unknown | src/routes/index.js:781 | — |
| 77 | /finvu/account-aggregator | FINVU_ROUTES.ACCOUNT_AGGREGATOR() | Finvu.AccountAggregator | unknown | src/routes/index.js:789 | — |
| 78 | /finvu/api-error | FINVU_ROUTES.API_ERROR() | Finvu.ApiError | unknown | src/routes/index.js:797 | — |
| 79 | * | NOT_FOUND | NotFound | unknown | src/routes/index.js:807 | — |

### Routes defined but not wired in router

| Path | Name / Key | Source |
|------|------------|--------|
| /mf-dashboard | MF_DASHBOARD | src/routes/routes.js:20 |
| /transactions | ORDERS | src/routes/routes.js:26 |
| /sips | FUNDS | src/routes/routes.js:27 |
| /switch | SWITCH | src/routes/routes.js:44 |

### Route tree

```
/
├── /home (Discover)
├── /portfolio
│   ├── /portfolio/schemes/:isin
│   └── /portfolio/analysis
│       ├── /portfolio/analysis/insights
│       └── /portfolio/analysis/allocation
├── /my-sips
│   └── /my-sips/sip-details/:sipId
├── /search → /search/results
├── /change-bank (+ upload, accounts, status, signature)
├── /pre-ir-report (+ onboarding, home, portfolio, portfolio-details/:isin)
├── /switch-funds (+ fund-selection, bulk-switch, benefits, folio, status, error)
├── /finvu (+ home, request, upload-details, fetch-status, status, account-aggregator, api-error)
└── *
```

## API Endpoints

### Outbound (frontend → backend)

| # | Method | Path | Label / Purpose | Called from | Auth | Notes |
|---|--------|------|-----------------|-------------|------|-------|
| 1 | GET | /mf/homepage/get-daily-schemes?type=:param&pageNumber=:param&pageSize=5 | FETCH_FUNDS (MF_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 2 | POST | /mftransaction/v3/:param/generateOTP | GENERATE_OTP (MF_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 3 | GET | /mftransaction/v7/:param/purchase | BUY_MF_V7 (MF_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 4 | POST | /mftransaction/otp/v4/:param/generateOTP | GENERATE_OTP_V4 (MF_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 5 | GET | /mftransaction/v2/:param/sip/:param | BUY_MF_V2 (MF_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 6 | GET | /aggr/home/v4/combined-dashboard | COMBINED_DASHBOARD (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 7 | GET | /aggr/home/v1/dashboard | MF_DASHBOARD (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 8 | GET | /aggr/equity/etf/v1/dashboard | ETF (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 9 | GET | /aggr/equity/ipo/v1/dashboard | IPO (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 10 | GET | /aggr/equity/stocks/v2/dashboard | STOCKS_DASHBOARD (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 11 | GET | /aggr/equity/fno/v1/dashboard | FNO_DASHBOARD (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 12 | GET | /mftransaction/v1/:param/sip-installments/:param?pageSize=:param&pageNumber=:param | GET_TRANSACTION_DETAILS (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 13 | GET | /portfolio/v1/getTopUpDetails/:param | GET_TOPUP_DETAILS (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 14 | GET | /mandate/api/v2/users/:param/otm-list | GET_OTM_LIST (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 15 | GET | /aggr/transaction/v1/buy/users/:param/schemes/:param:param | GET_SCHEME_DETAILS (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 16 | GET | /mf/v3/mf-scheme/details/:param | GET_FUND_DETAILS (AGGREGATOR_API) | src/config/urlConfig.js | session (inferred) | — |
| 17 | DELETE | /mandate/api/v2/paytm-pg/cancel-subscription | DELETE_SUBSCRIPTION (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 18 | POST | /mandate/api/v2/otm/create-subscription/paytmpg | INITIATE_MANDATE (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 19 | POST | /mandate/api/v2/otm/initiate-subscription/paytmpg | INITIATE_SUBSCRIPTION (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 20 | POST | /payments/api/v5/make-payment | MAKE_PAYMENT (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 21 | POST | /payments/api/v4/make-payment | MAKE_PAYMENT_V4 (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 22 | GET | /payments/api/v12/payment-option?txnAmount=:param | MANDATE_REG_OPTIONS (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 23 | GET | /payments/api/v12/payment-option?:param | MANDATE_REG_PAYMENT_OPTIONS (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 24 | GET | /mandate/api/v2/user/:param/validate-vpa?vpa=:param | VALIDATE_VPA (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 25 | POST | /mftransaction/v3/:param/generateOTP | GENERATE_OTP (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 26 | GET | /mftransaction/v7/:param/purchase | BUY_MF_V7 (AUTO_PAY_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 27 | GET | /payments/api/v4/validate-vpa | VALIDATE_VPA (PAYMENT_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 28 | GET | /payments/api/v3/balance-info | BALANCE_INFO (PAYMENT_API_URLS) | src/config/urlConfig.js | session (inferred) | — |
| 29 | POST | /logger/log | APP_LOG (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 30 | POST | /logger/time | APP_LOG_TIME (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 31 | GET | /userprofile/user/user_id/v5/readiness?product=MUTUAL_FUND,EQUITY,NPS | READINESS_V5 (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 32 | GET | /internal/mandate/api/v2/list/mandate-bank-config?page=0&pageSize=200&sortBy=bankName&sortByOrder=ASC&mandateSubType=UPI&clientInfoId=20 | BANK_MANDATES (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 33 | GET | /payments/api/v1/getBankSupportedPaymentOptions?product=equity | SUPPORTED_MANDATE_METHODS (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 34 | GET | /aggr/home/v4/combined-dashboard?keys=container-1 | GET_COMBINED_DASHBOARD_DATA (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 35 | GET | /mf/v1/top-performing-amcs?pageSize=50 | TOP_PERFORMING_AMC (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 36 | GET | /aggr/home/v4/combined-dashboard | COMBINED_DASHBOARD (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 37 | GET | /aggr/mf/v3/dashboard | MF_DASHBOARD (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 38 | GET | /aggr/journey/v1/widgets?businessType=MF_SIP_CNF&aggrKey=container-1 | DYNAMIC_WIDGET (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 39 | GET | /api/agg/getAccess | GET_ACCESS (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 40 | GET | /pm/api/v2/users/boot/:param?details=personalDetails | USER_BOOT (GENERIC_API_URL) | src/config/urlConfig.js | session (inferred) | — |
| 41 | GET | /data/v3/recent/searched | RECENT (SEARCH_REVAMP) | src/config/urlConfig.js | session (inferred) | — |
| 42 | GET | /data/v4/popular | POPULAR (SEARCH_REVAMP) | src/config/urlConfig.js | session (inferred) | — |
| 43 | GET | /data/v3/suggest?is-advanced-user=true&search-scope=:param&q=:param | RESULTS (SEARCH_REVAMP) | src/config/urlConfig.js | session (inferred) | — |
| 44 | GET | /portfolio/v2 | OVERVIEW (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 45 | GET | /portfolio/cas/v2 | CAS_V2 (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 46 | GET | /portfolio/cas/v1 | CAS_V1 (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 47 | GET | /payments/api/fetch-bse-user-details | BSE (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 48 | GET | /pf-kyc/v1/user-detail | KYC (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 49 | GET | /portfolio-insights/v1 | INSIGHTS (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 50 | GET | /portfolio/v4 | SCHEME_ISIN (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 51 | GET | /mf/v1/mf-scheme/exit-load | EXIT_LOAD (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 52 | GET | /mftransaction/v2 | SIP_LIST (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 53 | GET | /mf/v1/mostbought | CAROUSEL (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 54 | GET | /mf/v2 | POPULAR_SCHEME_AMC (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 55 | GET | /mf/v1 | TOP_PERFORMING_AMC (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 56 | GET | /mf/category | SUB_CATEGORY (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 57 | GET | /aggr/sf/pml-mf-portfolio-:param-v1 | PORTFOLIO_STOREFRONT (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 58 | GET | /aggr/journey/v1/widgets?businessType=MF_PORTFOLIO | PORTFOLIO_WIDGETS (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 59 | GET | /portfolio/cas/v1/aa-recon/resync-reason | AA_RECON_RESYNC_REASON (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 60 | GET | /portfolio/v2/:param/schemes | PORTFOLIO_SCHEMES (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 61 | GET | /portfolio-insights/overlap/v1/total-overlap/:param?isin=:param | GET_TOTAL_OVERLAP (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 62 | GET | /portfolio/v4/:param/isin/:param/tax-implications | TAX_IMPLICATIONS (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 63 | GET | /pf-fsa/v1/external-portfolio/users/:param/consent-status | CONSENT_STATUS (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 64 | GET | /mftransaction/v1/in-progress/transaction?userId=:param | IN_PROGRESS_TRANSACTIONS (PORTFOLIO) | src/config/urlConfig.js | session (inferred) | — |
| 65 | GET | /aggr/mf/v3/dashboard | AGGREGATOR (DASHBOARD) | src/config/urlConfig.js | session (inferred) | — |
| 66 | GET | /statement/v1/users | ACCOUNTS_STATEMENTS (DASHBOARD) | src/config/urlConfig.js | session (inferred) | — |
| 67 | GET | /aggr/mf/v3/dashboard | BASE_MF_URL (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 68 | GET | /aggr/mf/dashboard/v1/view-all | BASE_CL_URL (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 69 | GET | /mf/v2/search-mf-data | FEATURED_BY_AMC (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 70 | GET | /mf/v1/nfo/nfos-by-nfo-category | NFO_BY_CATEGORY (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 71 | GET | /mf/category/get-classification-subcategory | GET_CLASSIFICATION_SUBCATEGORY (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 72 | GET | /mf/homepage/get-daily-schemes | GET_SCHEME (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 73 | GET | /aggr/transaction/v1/buy/ | GET_NEXTDATE (DISCOVER) | src/config/urlConfig.js | session (inferred) | — |
| 74 | GET | /mf/v1/top-performing-fund-managers | TPFM_BY_CATEGORY (FUND_MANAGERS) | src/config/urlConfig.js | session (inferred) | — |
| 75 | GET | /mftransaction/v1/:param/sip-summary | SIP_SUMMARY (MY_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 76 | GET | /mftransaction/v1/:param/sip-details/:param | SIP_DETAILS (MY_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 77 | GET | /mftransaction/v1/:param/mf-sips | SIP_LIST (MY_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 78 | PUT | /mftransaction/v2/:param/sip/:param | SIP_PAUSE_RESUME (MY_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 79 | GET | /themes/v1/getactive | TG_ACTIVE (GETTHEMES) | src/config/urlConfig.js | session (inferred) | — |
| 80 | GET | /user-engagement/v1/users/:param/bookmarks | LIST (WATCHLIST_API) | src/config/urlConfig.js | session (inferred) | — |
| 81 | PUT | /user-engagement/v1/users/:param/bookmarks/:param?status=:param | MODIFY (WATCHLIST_API) | src/config/urlConfig.js | session (inferred) | — |
| 82 | GET | /user-engagement/v2/users/:param/isbookmarked/:param | STATUS (WATCHLIST_API) | src/config/urlConfig.js | session (inferred) | — |
| 83 | GET | /mftransaction/v1/sip-cancellation-feedback-list | FEEDBACK_LIST (CANCEL_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 84 | GET | /mf/v1/mf-scheme/transaction-meta/:param | TRANSACTION_META (CANCEL_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 85 | GET | /mini-app/data/:param/configDataMutualFund.json | PROJECTIONS_GRAPH_DATA (CANCEL_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 86 | POST | /mftransaction/v1/:param/generateOTP | GENERATE_OTP (CANCEL_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 87 | DELETE | /mftransaction/v2/:param/sip/:param | DELETE_SIP (CANCEL_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 88 | GET | /portfolio/lamf/v1/eligibilityCheck/:param | LAMF_ELIGIBILITY (CANCEL_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 89 | GET | /mini-app/data/:param/baskets.json | BASKET_ORDER (BASKET_ORDER) | src/config/urlConfig.js | session (inferred) | — |
| 90 | GET | /mini-app/data/:param/baskets/:param.json | BASKET_ORDER_DETAILS (BASKET_ORDER) | src/config/urlConfig.js | session (inferred) | — |
| 91 | GET | /mini-app/data/:param/popular_compare.json | POPULAR_COMPARE (FUND_COMPARE) | src/config/urlConfig.js | session (inferred) | — |
| 92 | GET | /mftransaction/v2/:param/paynow-investments | FETCH_PAY_NOW_INVESTMENTS (PENDING_INVESTMENT) | src/config/urlConfig.js | session (inferred) | — |
| 93 | GET | /mf/v1/mf-scheme/transaction-meta/:param | TRANSACTION_META (QUICK_SIP) | src/config/urlConfig.js | session (inferred) | — |
| 94 | GET | /mf/v2/search-mf-data | SEARCH_MF_DATA_V2 (POPULAR_FUNDS_API) | src/config/urlConfig.js | session (inferred) | — |
| 95 | GET | /mf/v1/curated-collections/:param/schemes | CURATED_COLLECTIONS (POPULAR_FUNDS_API) | src/config/urlConfig.js | session (inferred) | — |
| 96 | GET | /payments/api/fetch-bse-user-details/:param | BSE_DETAILS (ORDERPAD_VALIDATIONS) | src/config/urlConfig.js | session (inferred) | — |
| 97 | GET | /mftransaction/v3/:param/transaction/:param/status | TRANSACTION_STATUS (CROSS_SELL_EQUITY) | src/config/urlConfig.js | session (inferred) | — |
| 98 | GET | /portfolio/bank/change/:param/schemeDetails/:param | BANK_RELATED_SCHEMES (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 99 | GET | /portfolio/bank/change/:param/all/schemeDetails | LIST_OF_BANKS_WITH_SCHEMES (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 100 | POST | /portfolio/bank/change/:param/updateBankAndGenerateOtp | UPDATE_BANK_AND_SEND_OTP (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 101 | POST | /portfolio/bank/change/:param/verifyOtp | VERIFY_OTP (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 102 | GET | /portfolio/bank/change/:param/requestTimeline/:param | TIMELINE_STATUS (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 103 | POST | /dms/v1/upload | UPLOAD_DMS_DOCUMENT (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 104 | GET | /pm/api/v2/users/:param/bank-accounts?product=MUTUAL_FUND | BANK_ACCOUNT_LIST (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 105 | GET | /portfolio/bank/change/:param/isSignaturePresent | IS_SIGNATURE_PRESENT (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 106 | GET | /portfolio/bank/change/:param/refresh/currentStatus?auditId=:param | CURRENT_STATUS (CHANGE_BANK) | src/config/urlConfig.js | session (inferred) | — |
| 107 | POST | /aggr/mf/transaction/v1/initredeem | INIT_REDEEM_DETAILS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 108 | POST | /aggr/mf/transaction/v2/initredeem | INIT_REDEEM_DETAILS_V2 (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 109 | GET | /aggr/transaction/v2/sell/users/:param/schemes/:param | SELL_SCHEME_DETAILS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 110 | POST | /mftransaction/v2/:param/generateOTP | GENERATE_OTP_V2 (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 111 | POST | /mftransaction/v3/:param/redeem/confirm | CONFIRM_REDEEM (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 112 | GET | /mftransaction/v1/:param/transaction/twofaurl | BSE_2FA_DETAILS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 113 | GET | /mf/v1/mf-scheme/transaction-meta/:param | TRANSACTION_DETAILS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 114 | GET | /mftransaction/v1/:param/rta-bank-folio-level/:param | BANK_DETAILS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 115 | GET | /pm/api/v1/users/:param/bank-accounts | PML_LINKED_BANKS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 116 | GET | /portfolio/bank/change/:param/inProgress/:param | CHANGE_BANK_STATUS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 117 | GET | /mftransaction/v1/:param/redeem/transactions/status?transactionIds=:param | SELL_MULTIPLE_FOLIO_TRANSACTIONS (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 118 | POST | /mftransaction/v2/:param/redeem/transactions/status?transactionIds=:param | REDEEM_TRANSACTIONS_STATUS_V2 (SELL_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 119 | GET | /portfolio/v1/isSwitchEnabled/:param | IS_SWITCH_ENABLED (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 120 | GET | /portfolio/switch-funds/v1/:param/switch-overview | SWITCH_OVERVIEW (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 121 | GET | /portfolio/switch-funds/v1/:param/switch-to-direct | SWITCH_TO_DIRECT (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 122 | GET | /portfolio/switch-funds/v1/fund-summary?userId=:param&soIsin=:param&siIsin=:param | FUND_SUMMARY (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 123 | GET | /portfolio/switch-funds/v1/folio-wise-switchable-units?userId=:param&isins=:param | FOLIO_WISE_SWITCHABLE_UNITS (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 124 | GET | /portfolio/switch-funds/v1/regular-to-direct-mapping | REGULAR_TO_DIRECT_MAPPING (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 125 | GET | /portfolio/switch-funds/v1/switch-details | SWITCH_DETAILS (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 126 | GET | /mf/v2/search-mf-data | SEARCH_MF_DATA (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 127 | POST | /mftransaction/switch/v1/:param/initiateSwitch | INITIATE_SWITCH (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 128 | POST | /mftransaction/switch/v6/:param/generateOTP | GENERATE_OTP (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 129 | POST | /mftransaction/switch/v1/:param/confirmSwitch | CONFIRM_SWITCH (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 130 | GET | /mftransaction/switch/v1/:param/switchStatus?soTransactionIds=:param | SWITCH_STATUS (SWITCH_FLOW_API) | src/config/urlConfig.js | session (inferred) | — |
| 131 | GET | /pre-ir-portfolio/preir/v1/generate-token?oclUserId=:param | GENERATE_TOKEN (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 132 | GET | /pre-ir-portfolio/preir/v1/check-by-mobile | CHECK_BY_MOBILE (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 133 | GET | /pre-ir-portfolio/preir/v1/check-by-pan | CHECK_BY_PAN (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 134 | POST | /pre-ir-portfolio/preir/v1/:param/initiateCAS | INITIATE_CAS (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 135 | POST | /pre-ir-portfolio/preir/v1/:param/verifyOtpAndGetCas | VERIFY_OTP_AND_GET_CAS (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 136 | GET | /pre-ir-portfolio/preir/v1/:param/lastSync | LAST_SYNC (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 137 | GET | /pre-ir/v2/:param/lastSync | LAST_SYNC_V2 (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 138 | GET | /pre-ir-portfolio/preir/v1/:param | PORTFOLIO_OVERVIEW (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 139 | GET | /pre-ir-portfolio/preir/v1/:param/schemes | PORTFOLIO_SCHEMES (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 140 | GET | /pre-ir-portfolio/preir/v1/:param/schemes/:param | PORTFOLIO_SCHEMES_ISIN_LEVEL (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 141 | GET | /pre-ir-portfolio/preir/v1/:param/transaction-list/:param | PORTFOLIO_TRANSACTION_LIST (PRE_IR) | src/config/urlConfig.js | session (inferred) | — |
| 142 | GET | /pf-fsa/v1/external-portfolio/users/:param/consent/request | EXTERNAL_PORTFOLIO_CONSENT_REQUEST (FINVU_API) | src/config/urlConfig.js | session (inferred) | — |
| 143 | GET | /pf-fsa/v1/external-portfolio/mfc/users/:param/consent/request | MFC_CONSENT_REQUEST (FINVU_API) | src/config/urlConfig.js | session (inferred) | — |
| 144 | POST | /pf-fsa/v1/external-portfolio/mfc/users/:param/consent/approve | MFC_CONSENT_APPROVE (FINVU_API) | src/config/urlConfig.js | session (inferred) | — |
| 145 | GET | /pf-fsa/v1/external-portfolio/users/:param/consent-status | CONSENT_STATUS (FINVU_API) | src/config/urlConfig.js | session (inferred) | — |
| 146 | GET | /mf/v1/mf-scheme/nav/:param | CHART_NAV (CHART) | src/config/urlConfig.js | session (inferred) | — |
| 147 | GET | /aggr/sf/pml-mf-generic-prod-v1 | PML_APP_DOWNLOAD (STOREFRONT_API) | src/config/urlConfig.js | session (inferred) | — |
| 148 | GET | /mf/v3/mf-scheme/details/:param?type=INVESTMENT_RETURNS,FUND_INFORMATION,RISKOMETER,PAGE_LOAD | SCHEME_DETAILS_URL (SCHEME_DETAILS_PAGE) | src/config/urlConfig.js | session (inferred) | — |
| 149 | GET | /mftransaction/v1/reminder-widgets | REMINDER_WIDGET_DATA (MF_REMINDER_WIDGET) | src/config/urlConfig.js | session (inferred) | — |
| 150 | GET | /mini-app/data/:param/reminderWidget.json | REMINDER_WIDGET_STATIC_DATA (MF_REMINDER_WIDGET) | src/config/urlConfig.js | session (inferred) | — |

### Inbound (backend / mock service exposes)

mf-h5 is frontend-only. No inbound HTTP handlers in this repo. Mock fixtures live in sibling `mf-api-mock-service`.

## Route ↔ API Correlations

| Route | APIs used | Confidence |
|-------|-----------|------------|
| /home | GET /aggr/mf/v3/dashboard | inferred |
| /portfolio | GET /portfolio/v2/:userId/schemes, GET /portfolio/v2/:userId | inferred |
| /portfolio/schemes/:isin | GET /portfolio/v4/:userId/isin/:isin | inferred |
| /my-sips | GET /mftransaction/v1/:userId/sip-summary, GET /mftransaction/v1/:userId/mf-sips | inferred |
| /buy-order-pad | GET /aggr/transaction/v1/buy/users/:userId/schemes/:isin, POST /mftransaction/v7/:userId/purchase | inferred |
| /sell-order-pad | GET /aggr/transaction/v2/sell/users/:userId/schemes/:isin, POST /mftransaction/v3/:userId/redeem/confirm | inferred |
| /search | GET /data/v3/suggest, GET /data/v4/popular | inferred |
| /watchlist | GET /user-engagement/v1/users/:userId/bookmarks | inferred |
| /pre-ir-report/portfolio | GET /pre-ir-portfolio/preir/v1/:userId, GET /pre-ir/v2/:userId/lastSync | inferred |
| /finvu/home | GET /pf-fsa/v1/external-portfolio/users/:userId/consent-status | inferred |
| /switch-funds/fund-selection | GET /portfolio/switch-funds/v1/:userId/switch-overview | inferred |
| /scheme-details | GET /mf/v3/mf-scheme/details/:isin | inferred |

## Discovery notes

### Files examined
- `src/routes/routes.js` — route constants, PRE_IR/SWITCH_FUNDS/FINVU, deeplink helpers
- `src/routes/index.js` — React Router v6 route tree
- `src/config/urlConfig.js` — API registry (33 groups)
- `src/config/envConfig.js` — hosts and PRE_IR_ROOT
- `package.json`, `README.md`, `deeplink/manifest.json`

### Ambiguities & gaps
- PRE_IR_ROOT: `/pre-ir-report` (prod) vs `/pre-ir` (staging/beta)
- HTTP methods inferred from key names
- MF_DASHBOARD, ORDERS, FUNDS, SWITCH not wired in router
- No per-route auth guards (session via native webview)

### Recommendations
- Wire or remove unused route constants
- Consolidate inline APIs into urlConfig.js
- Scan `mf-api-mock-service` for inbound API map
