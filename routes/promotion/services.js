const Promotion = require('./../../models/Promotion');

// Recherche les promotions actives
async function getActivePromotions(serviceIds) {
    const now = new Date();
    return Promotion.find({
      serviceId: { $in: serviceIds },
      datedebut: { $lte: now },
      datefin: { $gte: now }
    });

}

// Applique le systeme de promotion aux services
async function applyPromotionsToServices(services, promotions) {
    const promotionMap = new Map();
    promotions.forEach(p => promotionMap.set(p.serviceId.toString(), p));
  
    return services.map(service => {
      const serviceObj = service.toObject();
      const promotion = promotionMap.get(service.serviceId._id.toString());
      
      if (promotion) {
        const reduction = (service.serviceId.prix * promotion.reduction) / 100;
        serviceObj.serviceId = {
          ...service.serviceId.toObject(),
          prixInitial: service.serviceId.prix,
          prixFinal: service.serviceId.prix - reduction,
          reductionAppliquee: reduction,
          promotion: {
            nom: promotion.nom,
            reduction: promotion.reduction,
            codepromo: promotion.codepromo
          }
        };
      } else {
        serviceObj.serviceId = {
          ...service.serviceId.toObject(),
          prixInitial: service.serviceId.prix,
          prixFinal: service.serviceId.prix,
          reductionAppliquee: 0,
          promotion: null
        };
      }
      
      return serviceObj;
    });
}

// Calcul le total initial et la reduction
function calculateTotals(services) {
    return services.reduce((acc, service) => {
      acc.totalInitial += service.serviceId.prixInitial;
      acc.totalReduction += service.serviceId.reductionAppliquee;
      return acc;
    }, { totalInitial: 0, totalReduction: 0 });
}

module.exports = {
    getActivePromotions,
    applyPromotionsToServices,
    calculateTotals
};