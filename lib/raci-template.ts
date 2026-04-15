export type RaciTemplateTask = {
  sequence: number;
  stage: string;
  name: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  costCr: number;
  timeDays: number;
  costWeight: number;
  timeWeight: number;
};

export const RACI_TEMPLATE_TASKS: RaciTemplateTask[] = [
  { sequence: 1, stage: "DPR", name: "Inception report", responsible: "Consultant", accountable: "Client", consulted: "PMC", informed: "Govt", costCr: 0.08, timeDays: 15, costWeight: 0.003498, timeWeight: 0.010316 },
  { sequence: 2, stage: "DPR", name: "Feasibility study", responsible: "Consultant", accountable: "Client", consulted: "Survey", informed: "PMC", costCr: 0.30, timeDays: 30, costWeight: 0.013118, timeWeight: 0.020633 },
  { sequence: 3, stage: "DPR", name: "Traffic survey", responsible: "Consultant", accountable: "Client", consulted: "Experts", informed: "PMC", costCr: 0.15, timeDays: 20, costWeight: 0.006559, timeWeight: 0.013755 },
  { sequence: 4, stage: "DPR", name: "Topographic survey", responsible: "Survey Team", accountable: "Consultant", consulted: "Contractor", informed: "Client", costCr: 0.20, timeDays: 25, costWeight: 0.008745, timeWeight: 0.017194 },
  { sequence: 5, stage: "DPR", name: "Geotech investigation", responsible: "Consultant", accountable: "Client", consulted: "Lab", informed: "PMC", costCr: 0.35, timeDays: 30, costWeight: 0.015304, timeWeight: 0.020633 },
  { sequence: 6, stage: "DPR", name: "LA Stage I", responsible: "Consultant", accountable: "Client", consulted: "Govt", informed: "PMC", costCr: 0.10, timeDays: 20, costWeight: 0.004373, timeWeight: 0.013755 },
  { sequence: 7, stage: "DPR", name: "DPR preparation", responsible: "Consultant", accountable: "Client", consulted: "AE", informed: "PMC", costCr: 0.80, timeDays: 45, costWeight: 0.034980, timeWeight: 0.030949 },
  { sequence: 8, stage: "DPR", name: "BOQ prep", responsible: "Consultant", accountable: "Client", consulted: "AE", informed: "PMC", costCr: 0.12, timeDays: 15, costWeight: 0.005247, timeWeight: 0.010316 },
  { sequence: 9, stage: "LA", name: "LA-II", responsible: "Consultant", accountable: "Client", consulted: "Govt", informed: "PMC", costCr: 0.20, timeDays: 30, costWeight: 0.008745, timeWeight: 0.020633 },
  { sequence: 10, stage: "LA", name: "LA-III", responsible: "Govt", accountable: "Client", consulted: "Consultant", informed: "PMC", costCr: 2.50, timeDays: 60, costWeight: 0.109314, timeWeight: 0.041265 },
  { sequence: 11, stage: "LA", name: "LA-IV", responsible: "Govt", accountable: "Client", consulted: "Consultant", informed: "Contractor", costCr: 1.80, timeDays: 90, costWeight: 0.078706, timeWeight: 0.061898 },
  { sequence: 12, stage: "Tender", name: "Tender prep", responsible: "Consultant", accountable: "Client", consulted: "PMC", informed: "Contractor", costCr: 0.10, timeDays: 15, costWeight: 0.004373, timeWeight: 0.010316 },
  { sequence: 13, stage: "Tender", name: "Tender invite", responsible: "Client", accountable: "Client", consulted: "Consultant", informed: "Public", costCr: 0.02, timeDays: 10, costWeight: 0.000875, timeWeight: 0.006878 },
  { sequence: 14, stage: "Tender", name: "Prequalification", responsible: "Client", accountable: "Client", consulted: "Consultant", informed: "PMC", costCr: 0.03, timeDays: 15, costWeight: 0.001312, timeWeight: 0.010316 },
  { sequence: 15, stage: "Tender", name: "Technical bid", responsible: "Client", accountable: "Client", consulted: "Consultant", informed: "Bidders", costCr: 0.02, timeDays: 5, costWeight: 0.000875, timeWeight: 0.003439 },
  { sequence: 16, stage: "Tender", name: "Financial bid", responsible: "Client", accountable: "Client", consulted: "Consultant", informed: "Bidders", costCr: 0.02, timeDays: 5, costWeight: 0.000875, timeWeight: 0.003439 },
  { sequence: 17, stage: "Tender", name: "LOA", responsible: "Client", accountable: "Client", consulted: "Consultant", informed: "Contractor", costCr: 0.01, timeDays: 7, costWeight: 0.000437, timeWeight: 0.004814 },
  { sequence: 18, stage: "Pre-Con", name: "AE appointment", responsible: "Client", accountable: "Client", consulted: "Consultant", informed: "Contractor", costCr: 0.30, timeDays: 15, costWeight: 0.013118, timeWeight: 0.010316 },
  { sequence: 19, stage: "Pre-Con", name: "Utility shifting", responsible: "Contractor", accountable: "Client", consulted: "Govt", informed: "PMC", costCr: 1.50, timeDays: 60, costWeight: 0.065588, timeWeight: 0.041265 },
  { sequence: 20, stage: "Pre-Con", name: "Clearances", responsible: "Govt", accountable: "Client", consulted: "Consultant", informed: "PMC", costCr: 0.50, timeDays: 90, costWeight: 0.021863, timeWeight: 0.061898 },
  { sequence: 21, stage: "Pre-Con", name: "Camp setup", responsible: "Contractor", accountable: "Contractor", consulted: "PMC", informed: "Client", costCr: 2.00, timeDays: 30, costWeight: 0.087451, timeWeight: 0.020633 },
  { sequence: 22, stage: "Design", name: "Design submission", responsible: "Contractor", accountable: "Contractor", consulted: "Consultant", informed: "Client", costCr: 0.15, timeDays: 20, costWeight: 0.006559, timeWeight: 0.013755 },
  { sequence: 23, stage: "Design", name: "Proof checking", responsible: "Consultant", accountable: "Client", consulted: "AE", informed: "Contractor", costCr: 0.08, timeDays: 15, costWeight: 0.003498, timeWeight: 0.010316 },
  { sequence: 24, stage: "Design", name: "AE review", responsible: "AE", accountable: "Client", consulted: "Consultant", informed: "Contractor", costCr: 0.05, timeDays: 10, costWeight: 0.002186, timeWeight: 0.006878 },
  { sequence: 25, stage: "Design", name: "Approval", responsible: "Client", accountable: "Client", consulted: "AE", informed: "Contractor", costCr: 0.02, timeDays: 7, costWeight: 0.000875, timeWeight: 0.004814 },
  { sequence: 26, stage: "Construction", name: "Earthwork", responsible: "Contractor", accountable: "Contractor", consulted: "AE", informed: "Client", costCr: 1.20, timeDays: 60, costWeight: 0.052470, timeWeight: 0.041265 },
  { sequence: 27, stage: "Construction", name: "Subgrade", responsible: "Contractor", accountable: "Contractor", consulted: "AE", informed: "PMC", costCr: 0.80, timeDays: 30, costWeight: 0.034980, timeWeight: 0.020633 },
  { sequence: 28, stage: "Construction", name: "GSB+WMM", responsible: "Contractor", accountable: "Contractor", consulted: "AE", informed: "PMC", costCr: 1.00, timeDays: 40, costWeight: 0.043725, timeWeight: 0.027510 },
  { sequence: 29, stage: "Construction", name: "Pavement", responsible: "Contractor", accountable: "Contractor", consulted: "AE", informed: "Client", costCr: 3.00, timeDays: 50, costWeight: 0.131176, timeWeight: 0.034388 },
  { sequence: 30, stage: "Construction", name: "Drainage", responsible: "Contractor", accountable: "Contractor", consulted: "AE", informed: "PMC", costCr: 0.70, timeDays: 40, costWeight: 0.030608, timeWeight: 0.027510 },
  { sequence: 31, stage: "Construction", name: "Structures", responsible: "Contractor", accountable: "Contractor", consulted: "AE", informed: "Client", costCr: 4.00, timeDays: 120, costWeight: 0.174902, timeWeight: 0.082531 },
  { sequence: 32, stage: "Post", name: "Testing", responsible: "AE", accountable: "Client", consulted: "Consultant", informed: "Contractor", costCr: 0.20, timeDays: 20, costWeight: 0.008745, timeWeight: 0.013755 },
  { sequence: 33, stage: "Post", name: "Final billing", responsible: "Contractor", accountable: "Client", consulted: "Consultant", informed: "PMC", costCr: 0.05, timeDays: 30, costWeight: 0.002186, timeWeight: 0.020633 },
  { sequence: 34, stage: "Post", name: "Handover", responsible: "Contractor", accountable: "Client", consulted: "AE", informed: "Public", costCr: 0.02, timeDays: 15, costWeight: 0.000875, timeWeight: 0.010316 },
  { sequence: 35, stage: "Post", name: "DLP", responsible: "Contractor", accountable: "Contractor", consulted: "Client", informed: "PMC", costCr: 0.50, timeDays: 365, costWeight: 0.021863, timeWeight: 0.251032 },
];
