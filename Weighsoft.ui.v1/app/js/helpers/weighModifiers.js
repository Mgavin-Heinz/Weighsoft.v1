function calculateMoisture(totalWeight, moisturePercentage, prescribedMoisture) {
  const moistureCoefficient = 100 - (100 - moisturePercentage) / (100 - prescribedMoisture);
  return totalWeight * moistureCoefficient;
}

export { calculateMoisture };
