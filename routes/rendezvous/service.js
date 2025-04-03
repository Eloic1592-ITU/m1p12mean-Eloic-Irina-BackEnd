const Rendezvous = require('./../../models/Rendezvous'); // Chemin vers votre modèle Rendezvous

async function getRendezvousStats() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  

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

  const currentMonthRendezvous = await Rendezvous.find({
    dateheure: {
      $gte: firstDayCurrentMonth,
      $lte: lastDayCurrentMonth
    }
  });
  console.log('Rendezous mois actuel:'+currentMonthRendezvous);

  const currentMonthCancelled = currentMonthRendezvous.filter(
    r => r.statut.toLowerCase() === 'annulé' || r.statut.toLowerCase() === 'annule'
  ).length;

  console.log('Rendezous mois actuel annulee:'+currentMonthCancelled);
  
  const currentMonthTotal = currentMonthRendezvous.length;
  const currentMonthCancellationRate = currentMonthTotal > 0 
    ? (currentMonthCancelled / currentMonthTotal) * 100 
    : 0;


  const prevMonthRendezvous = await Rendezvous.find({
    dateheure: {
      $gte: firstDayPrevMonth,
      $lte: lastDayPrevMonth
    }
  })
  console.log('Rendezous mois precedent:'+prevMonthRendezvous);
  
  const prevMonthCancelled = prevMonthRendezvous.filter(
    r => r.statut.toLowerCase() === 'annulé' || r.statut.toLowerCase() === 'annule'
  ).length;

  console.log('Rendezous mois precedent annulee:'+prevMonthCancelled);
  
  const prevMonthTotal = prevMonthRendezvous.length;
  const prevMonthCancellationRate = prevMonthTotal > 0 
    ? (prevMonthCancelled / prevMonthTotal) * 100 
    : 0;

  const totalVariation = currentMonthTotal - prevMonthTotal;
  const rateVariation = currentMonthCancellationRate - prevMonthCancellationRate;

  return {
    currentMonth: {
      total: currentMonthTotal,
      cancelled: currentMonthCancelled,
      cancellationRate: currentMonthCancellationRate.toFixed(2)
    },
    previousMonth: {
      total: prevMonthTotal,
      cancelled: prevMonthCancelled,
      cancellationRate: prevMonthCancellationRate.toFixed(2)
    },
    comparison: {
      totalVariation,
      rateVariation: rateVariation.toFixed(2)
    }
  };
}
module.exports = { getRendezvousStats };
