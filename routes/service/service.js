const ServiceVehicule = require('./../../models/Service_vehicule');
const Services = require('./../../models/Services'); 

async function getPopularServicesStats() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Mois précédent (en gérant le changement d'année)
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear--;
  }

  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
  const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
  
  const firstDayPrevMonth = new Date(prevYear, prevMonth, 1);
  const lastDayPrevMonth = new Date(prevYear, prevMonth + 1, 0);

  try {
    const currentMonthServices = await ServiceVehicule.aggregate([
      {
        $match: {
          datedebut: {
            $gte: firstDayCurrentMonth,
            $lte: lastDayCurrentMonth
          },
          statut: { $ne: "Annulé" } 
        }
      },
      {
        $group: {
          _id: "$serviceId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services", 
          localField: "_id",
          foreignField: "_id",
          as: "serviceDetails"
        }
      },
      { $unwind: "$serviceDetails" },
      {
        $project: {
          serviceId: "$_id",
          nom: "$serviceDetails.nom",
          descriptioncourte: "$serviceDetails.descriptioncourte",
          prix: "$serviceDetails.prix",
          duree: "$serviceDetails.duree",
          categorie: "$serviceDetails.categorie",
          image: "$serviceDetails.image",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Agrégation pour le mois précédent
    const prevMonthServices = await ServiceVehicule.aggregate([
      {
        $match: {
          datedebut: {
            $gte: firstDayPrevMonth,
            $lte: lastDayPrevMonth
          },
          statut: { $ne: "Annulé" }
        }
      },
      {
        $group: {
          _id: "$serviceId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceDetails"
        }
      },
      { $unwind: "$serviceDetails" },
      {
        $project: {
          serviceId: "$_id",
          nom: "$serviceDetails.nom",
          descriptioncourte: "$serviceDetails.descriptioncourte",
          prix: "$serviceDetails.prix",
          duree: "$serviceDetails.duree",
          categorie: "$serviceDetails.categorie",
          image: "$serviceDetails.image",
          count: 1,
          _id: 0
        }
      }
    ]);

    return {
      currentMonth: {
        period: `${firstDayCurrentMonth.toLocaleDateString()} - ${lastDayCurrentMonth.toLocaleDateString()}`,
        services: currentMonthServices
      },
      previousMonth: {
        period: `${firstDayPrevMonth.toLocaleDateString()} - ${lastDayPrevMonth.toLocaleDateString()}`,
        services: prevMonthServices
      },
      comparison: {
        totalCurrentMonth: currentMonthServices.reduce((acc, curr) => acc + curr.count, 0),
        totalPreviousMonth: prevMonthServices.reduce((acc, curr) => acc + curr.count, 0),
        evolution: currentMonthServices.map(currentService => {
          const prevService = prevMonthServices.find(s => s.serviceId.equals(currentService.serviceId));
          return {
            serviceId: currentService.serviceId,
            nom: currentService.nom,
            countEvolution: prevService 
              ? currentService.count - prevService.count 
              : currentService.count,
            percentageEvolution: prevService && prevService.count > 0
              ? ((currentService.count - prevService.count) / prevService.count * 100).toFixed(2)
              : "100.00" 
          };
        })
      }
    };

  } catch (error) {
    console.error("Erreur dans getPopularServicesStats:", error);
    throw error;
  }
}

async function getWeeklyRevenue() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Mois précédent - utilisation de let au lieu de const pour permettre la modification
    let prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    let prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
    // Fonction pour générer les semaines d'un mois
    function getWeeks(year, month) {
        const weeks = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Utilisation de let au lieu de const pour currentWeekStart car on la modifie
        let currentWeekStart = new Date(firstDay);
        
        while (currentWeekStart <= lastDay) {
          // Utilisation de const pour currentWeekEnd car on ne la modifie pas
          let currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
          if (currentWeekEnd > lastDay) {
            currentWeekEnd = new Date(lastDay); // Cette ligne cause l'erreur
          }
          
          weeks.push({
            start: new Date(currentWeekStart),
            end: new Date(currentWeekEnd)
          });
          
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        
        return weeks;
      }
  
    // Fonction helper pour calculer le CA par semaine pour un mois donné
    const getWeeklyRevenueForMonth = async (year, month) => {
      const weeks = getWeeks(year, month);
      
      const weeklyData = await Promise.all(
        weeks.map(async (week, index) => {
          const result = await ServiceVehicule.aggregate([
            {
              $match: {
                datedebut: { $gte: week.start, $lte: week.end },
                statut: { $ne: "Annulé" }
              }
            },
            {
              $lookup: {
                from: "services",
                localField: "serviceId",
                foreignField: "_id",
                as: "service"
              }
            },
            { $unwind: "$service" },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$service.prix" },
                count: { $sum: 1 }
              }
            }
          ]);
  
          return {
            weekNumber: index + 1,
            period: `${week.start.getDate()}/${week.start.getMonth()+1} - ${week.end.getDate()}/${week.end.getMonth()+1}`,
            revenue: result[0]?.revenue || 0,
            serviceCount: result[0]?.count || 0
          };
        })
      );
  
      return weeklyData;
    };
  
    try {
      // Récupérer les données des deux mois en parallèle
      const [currentMonthWeeks, prevMonthWeeks] = await Promise.all([
        getWeeklyRevenueForMonth(currentYear, currentMonth),
        getWeeklyRevenueForMonth(prevYear, prevMonth)
      ]);
  
      return {
        currentMonth: {
          month: `${currentMonth+1}/${currentYear}`,
          weeks: currentMonthWeeks,
          total: currentMonthWeeks.reduce((sum, week) => sum + week.revenue, 0)
        },
        previousMonth: {
          month: `${prevMonth+1}/${prevYear}`,
          weeks: prevMonthWeeks,
          total: prevMonthWeeks.reduce((sum, week) => sum + week.revenue, 0)
        },
        comparison: {
          revenueGrowth: currentMonthWeeks.reduce((sum, week) => sum + week.revenue, 0) - 
                        prevMonthWeeks.reduce((sum, week) => sum + week.revenue, 0),
          percentageGrowth: prevMonthWeeks.reduce((sum, week) => sum + week.revenue, 0) > 0 ?
            ((currentMonthWeeks.reduce((sum, week) => sum + week.revenue, 0) - 
             prevMonthWeeks.reduce((sum, week) => sum + week.revenue, 0)) / 
             prevMonthWeeks.reduce((sum, week) => sum + week.revenue, 0) * 100) : 0
        }
      };
  
    } catch (error) {
      console.error("Erreur dans getWeeklyRevenue:", error);
      throw error;
    }
}

async function getInterventionStats() {
  try {
    // 1. Compter toutes les interventions
    const totalInterventions = await ServiceVehicule.countDocuments();

    // 2. Compter les interventions par statut
    const interventionsByStatus = await ServiceVehicule.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Trouver les interventions terminées (statut "Terminé" ou équivalent)
    const finishedInterventions = interventionsByStatus.find(item => 
      item._id.toLowerCase().includes('terminé') || 
      item._id.toLowerCase().includes('termine')
    )?.count || 0;

    // 4. Calculer les interventions en cours
    const inProgressInterventions = totalInterventions - finishedInterventions;

    // 5. Optionnel: Durée moyenne des interventions terminées
    const durationStats = await ServiceVehicule.aggregate([
      {
        $match: {
          statut: { 
            $regex: /terminé|termine/i 
          }
        }
      },
      {
        $addFields: {
          durationHours: {
            $divide: [
              { $subtract: ["$datefin", "$datedebut"] },
              3600000 // 1 heure en millisecondes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$durationHours" },
          minDuration: { $min: "$durationHours" },
          maxDuration: { $max: "$durationHours" }
        }
      }
    ]);

    return {
      success: true,
      data: {
        totalInterventions,
        finishedInterventions,
        inProgressInterventions,
        completionPercentage: totalInterventions > 0 
          ? ((finishedInterventions / totalInterventions) * 100).toFixed(2)
          : 0,
        durationStats: durationStats[0] || null,
        statusDistribution: interventionsByStatus
      }
    };

  } catch (error) {
    console.error("Erreur dans getInterventionStats:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { getPopularServicesStats,getWeeklyRevenue ,getInterventionStats };