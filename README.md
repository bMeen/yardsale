# YardSale

A community auction marketplace with in-person pickup. Users sign in with Google, get a starter wallet, list items for auction, bid against each other in real time, and settle up through an in-app ledger-based wallet — no real money changes hands, everything is virtual currency (Naira-denominated).

This document is a plain-language overview for anyone reviewing or testing the app for the first time.

---

## What the app does

1. **Sign in with Google.** No separate signup form, no password.
2. **Pick a username.** First-time users are asked to choose a username before doing anything else in the app.
3. **Get a starter wallet.** Every new user is automatically credited ₦1,000,000 in play money.
4. **Browse auctions.** See what other community members are selling, filter by category, search, and watch a live countdown to each auction's end.
5. **Bid.** Place a bid, raise your own bid, or cancel a bid you no longer want (as long as you're not the current highest bidder).
6. **Create an auction.** List an item with photos, a description, a starting price, and a schedule — either starting immediately or at a future date/time.
7. **Win or lose.** When an auction ends, the highest bidder wins. Money moves automatically: the winner pays, the seller gets paid (minus a small platform fee), and everyone gets notified.
8. **Track everything.** "My Auctions" shows what you've listed, what you're bidding on, what you've won, and what you've sold. A watchlist lets you follow auctions you're interested in without bidding yet.
9. **Manage your wallet.** See your available balance, your reserved balance (money tied up in active bids), and a full activity history. If your balance ever drops low, you can reset it back to ₦1,000,000 for testing/play purposes.
10. **Get notified.** In-app notifications fire the moment something relevant happens — you're outbid, you won, your auction sold, your listing is ending soon, etc. — and update live without refreshing the page.

<!-- There's also an **admin side** (single administrator account, separate login) for moderating the platform — suspending users, cancelling problem auctions, creating official/system auctions, and viewing platform-wide statistics and revenue. This document focuses on the regular user experience; admin is covered separately. -->

---

## How money works (the short version)

- Listing an auction costs a flat fee ₦300
- Winning an auction moves money from your **reserved** balance to the seller, minus a 3% platform fee.
- Placing a bid doesn't spend money immediately — it **reserves** it. If you get outbid, the reservation is released back to your available balance automatically.
- Every single wallet movement (fees, reservations, releases, payouts) is logged and viewable in your wallet activity feed — nothing happens silently.

---

## How to go about testing it

1. **Use a real Google account** to sign in (no email/password signup exists for regular users).
2. On first login, you'll be dropped into a **username modal** — you can dismiss it, use the app. This happens until username is updated.
3. From there, explore freely: browse the marketplace, create an auction, bid on something (ideally with a second Google account/browser profile so you can bid against yourself and see both sides — outbidding, notifications, wallet changes).
4. Watch for **live updates** — if you have two browser windows open (as two different users) on the same auction, a bid placed in one should appear in the other within a second or two, with no refresh.
5. Check your **wallet activity** after every action (create auction, bid, get outbid, win, lose) to confirm the numbers match expectations.
6. Check your **notification bell** after every action that should trigger one.

---
