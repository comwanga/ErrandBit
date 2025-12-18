# ErrandBit: Non-KYC Bitcoin-Native Marketplace

## Privacy & Bitcoin Principles

ErrandBit is a **fully non-KYC platform** that adheres to Bitcoin's core principles of privacy, sovereignty, and permissionless access. We believe that commerce should be private by default and accessible to everyone, anywhere.

### Why Non-KYC?

1. **Privacy by Default**: No real names, addresses, or government IDs required
2. **Permissionless Access**: Anyone can participate regardless of location or banking status
3. **Bitcoin Values**: Aligned with Fedi wallet and the broader Bitcoin ethos
4. **Financial Freedom**: No surveillance, no permission needed, no data harvesting

## User Identity Model

### Pseudonymous Profiles

Users operate under **pseudonymous identities**:

- **Display Names**: Choose any nickname (e.g., "FastRunner", "LocalHelper")
- **Lightning Addresses**: Public payment endpoint only (e.g., `user@getalby.com`)
- **Optional Bio**: Share what you want, nothing more
- **Avatar**: Profile picture (optional, can be anonymous)
- **Reputation**: Earned through completed jobs, not identity verification

### No Personal Information Required

We **DO NOT** collect or require:

- ❌ Real names (first/last name)
- ❌ Physical addresses
- ❌ Government-issued IDs
- ❌ Social security numbers
- ❌ Bank account details
- ❌ Credit card information
- ❌ KYC documents

### What We Do Collect

Minimal information for service operation:

- ✅ Username (pseudonymous)
- ✅ Lightning address (for payments)
- ✅ Optional: Email (for notifications, not verified)
- ✅ Optional: Nostr public key (for decentralized identity)
- ✅ Location data (only when necessary for job proximity, never stored with identity)
- ✅ Job history and ratings (pseudonymous reputation)

## Authentication Methods

### 1. Username/Password (Recommended)
- Create any username (no email verification required)
- Set a strong password
- Fully anonymous login

### 2. Email (Optional, Unverified)
- Provide email for account recovery only
- No verification required
- Email never linked to real identity

### 3. Nostr (Future)
- Use your Nostr public key as identity
- Decentralized and censorship-resistant
- Compatible with Nostr ecosystem

## Payment Privacy

### Lightning Network Only

- **Instant settlements**: No waiting for bank transfers
- **Pseudo-anonymous**: No link between Lightning payments and identity
- **Low fees**: Minimal transaction costs
- **Global**: Works anywhere Bitcoin works

### Fedi Wallet Integration

- **Community custody**: Guardians instead of custodians
- **Non-KYC**: Fedi wallet requires no identity verification
- **WebLN**: One-click payments with browser wallet
- **Invoice generation**: Receive payments without exposing identity

## Location Privacy

### Proximity Without Exposure

- Location used **only** for job matching
- Approximate areas shown (never exact addresses)
- Job-specific locations only shared after acceptance
- No location tracking or history storage

### How It Works

1. **Job Posting**: Client shares approximate area (e.g., "Downtown Seattle")
2. **Runner Search**: Runners see jobs within their chosen radius
3. **Job Acceptance**: Specific meeting point shared after acceptance
4. **Completion**: No location data retained after job completion

## Data Minimization

### What We Store

```
User: {
  id: "uuid-12345",
  username: "FastRunner",
  lightning_address: "fastrunner@getalby.com",
  created_at: "2025-12-17"
}

Runner Profile: {
  display_name: "FastRunner",
  bio: "Quick local deliveries",
  hourly_rate: 50000, // sats
  avg_rating: 4.8,
  total_jobs: 47
}
```

### What We Don't Store

- No passport/ID scans
- No selfie verification
- No address verification
- No bank statements
- No credit checks
- No phone verification (optional only)

## Legal & Compliance

### Peer-to-Peer Marketplace

ErrandBit is a **peer-to-peer platform** where:
- Users contract directly with each other
- Platform facilitates matching and payments only
- No employment relationships created
- Users responsible for local tax obligations

### Anti-Money Laundering (AML)

We comply with applicable laws while respecting privacy:
- Transaction limits prevent large-scale abuse
- Community moderation and reputation system
- Suspicious activity monitoring without identity collection
- Cooperation with law enforcement when legally required

### Terms of Service

By using ErrandBit, users agree to:
- Act in good faith and complete jobs honestly
- Not use platform for illegal activities
- Respect other users' privacy
- Comply with local laws in their jurisdiction

## Comparison: Traditional vs Non-KYC

| Feature | Traditional Gig Platforms | ErrandBit |
|---------|--------------------------|-----------|
| ID Verification | Required | Not required |
| Bank Account | Required | Not required |
| Tax Forms (1099, W-2) | Required | Not required |
| Real Name | Required | Pseudonymous |
| Physical Address | Required | Not required |
| Phone Verification | Required | Optional |
| Payment Method | Bank transfer, ACH | Lightning only |
| Data Collection | Extensive | Minimal |
| Account Freeze | Common | Rare (trust system) |
| Global Access | Restricted | Permissionless |

## Security Without Surveillance

### Trust Through Reputation

Instead of identity verification, we use:

1. **Job History**: Completed jobs visible on profile
2. **Star Ratings**: 5-star system from actual clients
3. **Written Reviews**: Text feedback from completed jobs
4. **Completion Rate**: Percentage of accepted jobs completed
5. **Response Time**: How quickly runners respond
6. **Dispute Resolution**: Community-based mediation

### Escrow System

- Client funds held until job completion
- Runner can't be cheated after completing work
- Disputes resolved through evidence and reputation
- Automated releases for smooth transactions

## Best Practices for Users

### For Runners (Service Providers)

- **Choose professional username**: Build your brand
- **Write detailed bio**: Explain your skills and specialties
- **Complete jobs reliably**: Reputation is everything
- **Communicate clearly**: Good service earns repeat clients
- **Set fair rates**: Market will determine your pricing

### For Clients (Job Posters)

- **Clear job descriptions**: Explain exactly what you need
- **Fair pricing**: Competitive rates attract quality runners
- **Timely communication**: Respond to runners quickly
- **Honest reviews**: Help other clients make good choices
- **Prompt payment**: Release escrow immediately after completion

## Privacy-Preserving Features

### Anonymous Messaging
- All communication through platform
- No need to share phone number or personal contact

### Temporary Meeting Points
- Share specific locations only when necessary
- Option to use public meeting spots
- No permanent location tracking

### Selective Information Sharing
- Choose what to reveal in your profile
- Job-specific details shared only after acceptance
- Control your digital footprint

## FAQ

**Q: How do you prevent fraud without ID verification?**  
A: Reputation system, escrow, community moderation, and Lightning's built-in fraud resistance.

**Q: What if someone posts illegal jobs?**  
A: Community reporting, automated content filtering, and cooperation with law enforcement.

**Q: Can I get banned?**  
A: Yes, for Terms of Service violations, but you can create a new account (reputation starts fresh).

**Q: Is this really legal?**  
A: Yes. Peer-to-peer commerce and Bitcoin are legal in most jurisdictions. Users must comply with local laws.

**Q: What about taxes?**  
A: Users are responsible for their own tax obligations. We don't issue 1099s or report earnings.

**Q: Why Lightning only?**  
A: Privacy, speed, low fees, and global accessibility. Traditional payments require KYC.

**Q: What if I lose my password?**  
A: Email recovery available (if you provided email). Otherwise, reputation is non-transferable.

## Roadmap: Enhanced Privacy

### Coming Soon

- **Nostr Integration**: Decentralized identity portable across platforms
- **Tor Support**: Access ErrandBit through Tor for maximum privacy
- **Encrypted Messaging**: End-to-end encrypted chat for sensitive discussions
- **Submarine Swaps**: Convert on-chain Bitcoin to Lightning privately
- **Taproot Assets**: Multi-asset support while maintaining privacy

### Future Considerations

- **Zero-Knowledge Proofs**: Prove reputation without revealing identity
- **Multi-Sig Escrow**: Enhanced security without custodians
- **Decentralized Dispute Resolution**: DAO-style governance
- **Cross-Platform Reputation**: Import reputation from other non-KYC platforms

## Philosophy

> **"Fix the money, fix the world."** - Bitcoin Maxim

ErrandBit embodies this philosophy by creating a marketplace where:
- Financial privacy is a default, not a premium feature
- Anyone can earn and spend without permission
- Reputation replaces invasive surveillance
- Bitcoin's values extend beyond just currency

We believe that a truly free market requires financial privacy. ErrandBit proves that privacy and trust can coexist—you don't need to surrender your identity to participate in the economy.

---

## Get Started

Ready to experience permissionless commerce?

1. **Choose a username** (any pseudonym you like)
2. **Set your Lightning address** (get one from Alby, Strike, or Fedi)
3. **Create your profile** (share as much or as little as you want)
4. **Start earning or hiring** (reputation builds with every job)

Welcome to the non-KYC economy. Welcome to ErrandBit.

**Your privacy. Your reputation. Your Bitcoin.**
