import Vue from 'vue';

const EventsService = {
  // cancel booking
  loadApplications(eventId) {
    return Vue.http.get(`${Vue.config.apiServer}/api/2.0/user/events/${eventId}/applications`);
  },
  // cancel booking
  manageTickets(applications) {
    applications.forEach((application) => {
      /* eslint-disable no-param-reassign */
      application.emailSubject = {
        received: 'Your ticket request for %1$s has been received',
        approved: 'Your ticket request for %1$s has been approved',
        cancelled: 'Your ticket request for %1$s has been cancelled',
      };
      /* eslint-enable no-param-reassign */
    });
    return Vue.http.post(`${Vue.config.apiServer}/api/2.0/events/bulk-apply-applications`, { applications });
  },
  // Dojo Stats, blame me but that's the fastest of the existing endpoint
  searchApplicationsByDojo(dojoId, params) {
    return Vue.http.post(`${Vue.config.apiServer}/api/2.0/events/applications/search`, { query: { dojoId, ...params } });
  },
  v3: {
    get(dojoId, options) {
      return Vue.http.get(`${Vue.config.apiServer}/api/3.0/dojos/${dojoId}/events`, options);
    },
    createOrder(eventId, applications) {
      return Vue.http.post(`${Vue.config.apiServer}/api/3.0/events/${eventId}/orders`, { applications });
    },
    updateOrder(orderId, userId, applications) {
      return Vue.http.put(`${Vue.config.apiServer}/api/3.0/users/${userId}/orders/${orderId}`, { applications });
    },
    getOrder(userId, options) {
      return Vue.http.get(`${Vue.config.apiServer}/api/3.0/users/${userId}/orders`, options);
    },
  },
};

export default EventsService;
