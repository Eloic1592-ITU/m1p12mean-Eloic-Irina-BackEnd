const Service_vehicule = require('./../../models/Service_vehicule');
const { getActivePromotions,applyPromotionsToServices, calculateTotals } = require('../promotion/services');

async function generateInvoiceData(rendezvousId) {
    console.log("mety");
  // 1. Récupération des services de base
  const serviceVehicules = await Service_vehicule.find({ rendezvousId })
    .populate({
      path: 'vehiculeId',
      select: 'Immatriculation marque modele '
    })
    .populate({
      path: 'serviceId', 
      select: 'nom prix descriptioncourte'
    });

  if (!serviceVehicules.length) {
    throw new Error('Aucun service trouvé pour ce rendez-vous');
  }

  // 2. Récupération et application des promotions
  const serviceIds = serviceVehicules.map(s => s.serviceId._id);
  const promotions = await getActivePromotions(serviceIds);
  const servicesWithPromotions = await applyPromotionsToServices(serviceVehicules, promotions);

  // 3. Calcul des totaux
  const { totalInitial, totalReduction } = calculateTotals(servicesWithPromotions);
  const totalFinal = totalInitial - totalReduction;

  // 4. Formatage de la réponse
  return {
    services: servicesWithPromotions,
    totals: {
      initial: totalInitial.toFixed(2),
      reduction: totalReduction.toFixed(2),
      final: totalFinal.toFixed(2)
    },
    count: serviceVehicules.length,
    generatedAt: new Date().toISOString(),
    rendezvousId
  };
}

module.exports = { generateInvoiceData };