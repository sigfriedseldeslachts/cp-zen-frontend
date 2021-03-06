import vueUnitHelper from 'vue-unit-helper';
import BookingConfirmationComponent from '!!vue-loader?inject!@/events/order/cd-booking-confirmation';

describe('Booking Confirmation Component', () => {
  let sandbox;
  let MockEventService;
  let OrderStore;
  let BookingConfirmationComponentWithMocks;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    MockEventService = {
      v3: {
        getOrder: sandbox.stub(),
      },
    };
    OrderStore = {
      commit: sandbox.stub(),
    };
    BookingConfirmationComponentWithMocks = BookingConfirmationComponent({
      '@/events/service': MockEventService,
      '@/events/order/order-store': OrderStore,
    });
    vm = vueUnitHelper(BookingConfirmationComponentWithMocks);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('methods.loadData()', () => {
    it('should load create user and booking data from the store', async () => {
      // ARRANGE
      MockEventService.v3.getOrder.resolves({ body: { results: [] } });
      vm.eventId = 'foo';
      vm.event = { id: 'foo' };
      vm.loggedInUser = { id: 'bar' };

      // ACT
      await vm.loadData();

      // ASSERT
      expect(MockEventService.v3.getOrder).to.have.been.calledOnce;
      expect(MockEventService.v3.getOrder).to.have.been.calledWith('bar', { params: { 'query[eventId]': 'foo' } });
    });
  });

  describe('methods.getSessionName', () => {
    it('should get the session name for the session.id', () => {
      // ARRANGE
      const sessionId = '1';
      vm.event = {
        sessions: [{
          id: '1',
          name: 'banana',
        }] };

      // ACT
      const sessionName = vm.getSessionName(sessionId);

      // ASSERT
      expect(sessionName).to.equal('banana');
    });
  });
  describe('computed', () => {
    describe('computed.title', () => {
      it('should return the proper title when the event requires ticket approval', () => {
        vm.$t = sinon.stub().returnsArg(0);
        vm.event = {
          ticketApproval: true,
        };
        expect(vm.title).to.equal('Booking Request Sent');
      });
      it('should return the proper title when the event doesnt require ticket approval', () => {
        vm.$t = sinon.stub().returnsArg(0);
        vm.event = {
          ticketApproval: false,
        };
        expect(vm.title).to.equal('Booking Complete');
      });
    });
    describe('computed.subtitle', () => {
      it('should return the proper subtitle when the event requires ticket approval', () => {
        vm.$t = sinon.stub().returnsArg(0);
        vm.event = {
          ticketApproval: true,
        };
        expect(vm.subtitle).to.equal('You will be notified when the organizer approves your request.');
      });
      it('should return the proper subtitle when the event doesnt require ticket approval', () => {
        vm.$t = sinon.stub().returnsArg(0);
        vm.event = {
          ticketApproval: false,
        };
        vm.loggedInUser = {
          email: 'doo@do.do',
        };
        expect(vm.subtitle).to.equal('A confirmation email has been sent to {email}', { email: '<strong>doo@do.do</strong>' });
      });
    });
  });

  describe('created()', () => {
    it('should load booking data', () => {
      // ARRANGE
      sandbox.stub(vm, 'loadData');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.loadData).to.have.been.calledOnce;
    });
  });
  describe('destroyed()', () => {
    it('should empty the current order store', () => {
      // ACT
      vm.$lifecycleMethods.destroyed();

      // ASSERT
      expect(OrderStore.commit).to.have.been.calledTwice;
      expect(OrderStore.commit.getCall(1)).to.have.been.calledWith('resetStatuses');
      expect(OrderStore.commit.getCall(0)).to.have.been.calledWith('resetApplications');
    });
  });
});
