const Rendezvous = require('../models/Rendezvous'); 

// Fonction pour vérifier la disponibilité d'une date
const isDateAvailable = async (date) => {
    const debutJour = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const finJour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  
    // Compter le nombre de rendez-vous prévus pour cette journée
    const count = await Rendezvous.countDocuments({
      dateheure: {
        $gte: debutJour,
        $lt: finJour
      }
    });
  
    // Définir un seuil maximum (par exemple, 5 rendez-vous par jour)
    const MAX_RENDEZVOUS_PER_DAY = 2;
    return count < MAX_RENDEZVOUS_PER_DAY;
  };
  
  // SUGGESTION DE DATE 
  const suggestAlternativeDates = async (date) => {
    const suggestedDates = [];
    const MAX_SUGGESTIONS = 4; // Nombre maximum de suggestions à retourner
  
    // Vérifier les jours suivants
    for (let i = 1; i <= 7; i++) { // Proposer des dates dans les 7 prochains jours
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + i);
  
      if (await isDateAvailable(newDate)) {
        suggestedDates.push(newDate);
        if (suggestedDates.length >= MAX_SUGGESTIONS) break; // Limiter le nombre de suggestions
      }
    }
  
    return suggestedDates;
};

const suggestTimeSlots = async (date) => {
    const availableSlots = [];
    const startHour = 9; // Heure d'ouverture (9h)
    const endHour = 18;  // Heure de fermeture (18h)
    const slotDuration = 60; // Durée d'un créneau en minutes (1 heure)
  
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0); // Début du créneau
  
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + slotDuration); // Fin du créneau
  
      // Vérifier si le créneau est disponible
      const isSlotAvailable = await Rendezvous.countDocuments({
        dateheure: {
          $gte: slotStart,
          $lt: slotEnd
        }
      }) === 0;
  
      if (isSlotAvailable) {
        availableSlots.push(slotStart);
      }
    }
  
    return availableSlots;
  };

module.exports = {
    isDateAvailable,
    suggestAlternativeDates,
    suggestTimeSlots
  };