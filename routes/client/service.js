const ServiceVehicule = require('./../../models/Service_vehicule');
const Vehicule = require('./../../models/Vehicule');
const Rendezvous = require('./../../models/Rendezvous');

async function calculateClientRetention() {
  try {
    // 1. Calculer le nombre total de clients uniques
    const totalClients = await Vehicule.distinct('clientId').countDocuments();

    if (totalClients === 0) {
      return {
        success: true,
        data: {
          retentionRate: 0,
          message: "Aucun client trouvé dans la base de données"
        }
      };
    }

    // 2. Trouver les clients récurrents (ceux avec ≥2 rendez-vous)
    const recurrentClients = await ServiceVehicule.aggregate([
      {
        $lookup: {
          from: "vehicules",
          localField: "vehiculeId",
          foreignField: "_id",
          as: "vehicule"
        }
      },
      { $unwind: "$vehicule" },
      {
        $group: {
          _id: "$vehicule.clientId",
          appointmentCount: { $sum: 1 },
          lastAppointment: { $max: "$datedebut" },
          firstAppointment: { $min: "$datedebut" }
        }
      },
      { $match: { appointmentCount: { $gte: 2 } } },
      { $count: "recurrentClientCount" }
    ]);

    const recurrentClientCount = recurrentClients[0]?.recurrentClientCount || 0;

    // 3. Calculer le taux de fidélisation
    const retentionRate = (recurrentClientCount / totalClients) * 100;

    // 4. Optionnel: Obtenir les détails des clients les plus fidèles
    const topLoyalClients = await ServiceVehicule.aggregate([
      {
        $lookup: {
          from: "vehicules",
          localField: "vehiculeId",
          foreignField: "_id",
          as: "vehicule"
        }
      },
      { $unwind: "$vehicule" },
      {
        $lookup: {
          from: "clients",
          localField: "vehicule.clientId",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $group: {
          _id: "$vehicule.clientId",
          clientName: { $first: "$client.nom" },
          clientEmail: { $first: "$client.email" },
          appointmentCount: { $sum: 1 },
          lastAppointment: { $max: "$datedebut" }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 }
    ]);

    return {
      success: true,
      data: {
        totalClients,
        recurrentClientCount,
        retentionRate: retentionRate.toFixed(2),
        topLoyalClients,
        formula: "(Clients récurrents / Total clients) × 100"
      }
    };

  } catch (error) {
    console.error("Erreur dans calculateClientRetention:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { calculateClientRetention };