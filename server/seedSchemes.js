/**
 * AgriVision – Government Schemes Seed Script
 * Run from the /server directory: node seedSchemes.js
 * This script inserts 10 real Indian government agriculture schemes.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');

dotenv.config();

const schemes = [
  {
    title: 'PM-KISAN Samman Nidhi Yojana',
    description:
      'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector Scheme that provides income support of ₹6,000 per year in three equal installments of ₹2,000 every four months directly to the bank accounts of all eligible farmer families across India.',
    eligibility:
      'All land-holding farmer families with cultivable land, excluding income-tax payers, institutional landholders, and those holding constitutional posts. Farmers must have valid Aadhaar and be registered on the PM-KISAN portal.',
    state: 'All',
  },
  {
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description:
      'PMFBY provides comprehensive crop insurance to farmers against natural calamities, pests, and diseases. It covers all food crops, oilseeds, and annual commercial/horticultural crops with a very low premium rate for farmers.',
    eligibility:
      'All farmers—whether loanee or non-loanee—growing notified crops in notified areas. Farmers must have a bank account and sow the notified crop in the notified area. Enrollment is voluntary for non-loanee farmers.',
    state: 'All',
  },
  {
    title: 'Kisan Credit Card (KCC) Scheme',
    description:
      'The Kisan Credit Card scheme provides adequate and timely credit to farmers for their agricultural operations, allied activities, and non-farm short-term credit needs. The card provides a revolving credit facility with a flexible repayment schedule.',
    eligibility:
      'All farmers—including individual/joint borrowers, tenant farmers, oral lessees, and sharecroppers—are eligible. Self Help Groups (SHGs) and Joint Liability Groups (JLGs) of farmers are also eligible. No upper land-holding limit applies.',
    state: 'All',
  },
  {
    title: 'Soil Health Card (SHC) Scheme',
    description:
      'The Soil Health Card Scheme issues soil health cards to farmers which carry crop-wise recommendations of nutrients and fertilizers required for individual farms. This helps farmers improve soil health and optimize fertilizer usage, thereby reducing input costs.',
    eligibility:
      'All farmers across India are eligible. A soil health card is issued once every two years. Farmers can carry their land records (7/12 or equivalent) to the nearest Soil Testing Laboratory or Krishi Vigyan Kendra to get their soil tested.',
    state: 'All',
  },
  {
    title: 'National Agriculture Market (eNAM) Scheme',
    description:
      'eNAM is a pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities. It enables farmers to list produce online, receive competitive price discovery, and get online payment.',
    eligibility:
      'All farmers, traders, and buyers registered on the eNAM portal can participate. Farmers must have a bank account linked to their Aadhaar for direct online payment. Registration is free and can be done at any linked APMC mandi.',
    state: 'All',
  },
  {
    title: 'Micro Irrigation Fund (MIF) – PMKSY',
    description:
      'Under Pradhan Mantri Krishi Sinchayee Yojana, the Micro Irrigation Fund provides states with low-interest loans to expand drip and sprinkler irrigation beyond the standard subsidy ambit. Aims to achieve "Har Khet Ko Pani" and "More Crop Per Drop".',
    eligibility:
      'States and Union Territories are the primary borrowers. Farmers in enrolled state schemes benefit from subsidized micro-irrigation installations. Small and marginal farmers with land holdings up to 5 acres get higher subsidy rates under state-specific plans.',
    state: 'All',
  },
  {
    title: 'Rythu Bandhu Scheme',
    description:
      'Rythu Bandhu is a farmer investment support scheme by the Government of Telangana that provides ₹10,000 per acre per year (₹5,000 per season) as upfront financial support to all farm land-owning farmers, enabling them to purchase inputs without loans.',
    eligibility:
      'All land-owning farmers in Telangana holding valid pattadar passbooks are eligible. Tenant farmers and landless agricultural labourers are not covered under this scheme. There is no upper limit on land holding.',
    state: 'Telangana',
  },
  {
    title: 'Mukhyamantri Kisan Kalyan Yojana (MKKY)',
    description:
      'Launched by the Government of Madhya Pradesh, MKKY provides an additional financial benefit of ₹4,000 per year (₹2,000 per installment) to farmers already registered under PM-KISAN, effectively increasing their total income support to ₹10,000 per year.',
    eligibility:
      'Only farmers already enrolled and receiving benefits under the central PM-KISAN scheme and residing in Madhya Pradesh are eligible. They must have valid Aadhaar-linked bank accounts and updated land records in the state government database.',
    state: 'Madhya Pradesh',
  },
  {
    title: 'Pradhan Mantri Kisan MAN-DHAN Yojana (PM-KMY)',
    description:
      'PM-KMY is a voluntary and contributory pension scheme for small and marginal farmers. On attaining the age of 60 years, eligible farmers receive a minimum assured pension of ₹3,000 per month. If the farmer dies, the spouse receives 50% as family pension.',
    eligibility:
      'Small and marginal farmers aged 18–40 years with cultivable land up to 2 hectares, not covered under NPS, ESIC, or EPFO, and who are not income-tax payers are eligible. Monthly contribution ranges from ₹55 to ₹200 based on entry age.',
    state: 'All',
  },
  {
    title: 'Agriculture Infrastructure Fund (AIF)',
    description:
      'AIF is a medium-to-long-term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets through interest subvention and financial support. The fund size is ₹1 Lakh Crore.',
    eligibility:
      'Farmers, FPOs, PACS, Marketing Cooperative Societies, SHGs, Joint Liability Groups, Multipurpose Cooperative Societies, Agri-entrepreneurs, Startups, and State Agencies/APMCs are eligible. Projects must be for post-harvest management and farm-level aggregation infrastructure.',
    state: 'All',
  },
];

const seedDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing schemes to avoid duplicates on re-run
    await Scheme.deleteMany({});
    console.log('🗑️  Cleared existing scheme records');

    // Insert the 10 schemes
    const inserted = await Scheme.insertMany(schemes);
    console.log(`🌱 Successfully seeded ${inserted.length} government schemes:`);
    inserted.forEach((s, i) => console.log(`   ${i + 1}. ${s.title}`));

    console.log('\n✅ Seeding complete! You can now view schemes in the portal.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
