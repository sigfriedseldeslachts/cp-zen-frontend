import vueUnitHelper from 'vue-unit-helper';
import BookingCreateAccountComponent from '!!vue-loader?inject!@/events/cd-booking-create-account';

describe('Booking Create Account Form', () => {
  const sandbox = sinon.sandbox.create();
  const MockStoreService = {
    save: sandbox.stub(),
    load: sandbox.stub(),
  };
  const MockUsersService = {
    register: sandbox.stub(),
  };
  const BookingCreateAccountComponentWithMocks = BookingCreateAccountComponent({
    '@/store/store-service': MockStoreService,
    '@/users/service': MockUsersService,
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should generate user computed property', () => {
    // ARRANGE
    const expectedUser = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1-555-123456',
      email: 'john.doe@example.com',
      password: 'Passw0rd',
      'g-recaptcha-response': 'abc123',
      initUserType: {
        title: 'Parent/Guardian',
        name: 'parent-guardian',
      },
      termsConditionsAccepted: true,
    };
    const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
    vm.parent = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1-555-123456',
      email: 'john.doe@example.com',
    };
    vm.password = 'Passw0rd';
    vm.recaptchaResponse = 'abc123';
    vm.termsConditionsAccepted = true;

    // ACT
    const user = vm.user;

    // ASSERT
    expect(user).to.deep.equal(expectedUser);
  });

  it('should register the user', (done) => {
    // ARRANGE
    const storedBookingData = {
      parent: {
        firstName: 'Foo',
        lastName: 'Bar',
        phoneNumber: '012345678',
        email: 'foo.bar@baz.com',
      },
    };
    MockStoreService.load.returns(storedBookingData);

    const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
    vm.user = {
      firstName: 'Foo',
      lastName: 'Bar',
      phoneNumber: '012345678',
      email: 'foo.bar@baz.com',
      password: 'Passw0rd',
      'g-recaptcha-response': 'abc123',
      initUserType: {
        title: 'Parent/Guardian',
        name: 'parent-guardian',
      },
    };
    vm.eventId = 1;
    vm.$router = {
      push: sinon.stub(),
    };
    MockUsersService.register.returns(Promise.resolve());

    // ACT
    vm.register();

    // ASSERT
    requestAnimationFrame(() => {
      expect(MockUsersService.register).to.have.been.calledWith(vm.user, storedBookingData.parent);
      expect(MockStoreService.save).to.have.been.calledWith(`booking-${vm.eventId}`, {
        parent: storedBookingData.parent,
        accountCreated: true,
      });
      expect(vm.$router.push).to.have.been.calledWith(`/events/${vm.eventId}/confirmation`);
      done();
    });
  });

  describe('onSubmit()', () => {
    it('should fail when recaptchaResponse exists, but passwords dont match', () => {
      // ARRANGE
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.password = 'foo';
      vm.confirmPassword = 'bar';
      vm.termsConditionsAccepted = true;
      sandbox.stub(window, 'alert');

      // ACT
      vm.onSubmit();

      // ASSERT
      expect(window.alert).to.have.been.calledWith('Passwords do not match');
    });
    it('should fail without recaptchaResponse', () => {
      // ARRANGE
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.password = 'foo';
      vm.confirmPassword = 'foo';
      vm.termsConditionsAccepted = true;
      sandbox.stub(window, 'alert');

      // ACT
      vm.onSubmit();

      // ASSERT
      expect(window.alert).to.have.been.calledWith('Please complete reCAPTCHA');
    });
    it('should fail when recaptchaResponse exists, but passwords dont match', () => {
      // ARRANGE
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.password = 'foo';
      vm.confirmPassword = 'foo';
      vm.recaptchaResponse = 'abc123';
      sandbox.stub(window, 'alert');

      // ACT
      vm.onSubmit();

      // ASSERT
      expect(window.alert).to.have.been.calledWith('Please read and accept T&Cs');
    });
    it('should call register when passwords match and recaptchaResponse exists', () => {
      // ARRANGE
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.password = 'foo';
      vm.confirmPassword = 'foo';
      vm.recaptchaResponse = 'abc123';
      vm.termsConditionsAccepted = true;
      sandbox.stub(vm, 'register');

      // ACT
      vm.onSubmit();

      // ASSERT
      expect(vm.register).to.have.been.calledOnce;
    });
  });

  it('should store recaptchaResponse on verification', () => {
    // ARRANGE
    const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);

    // ACT
    vm.onRecaptchaVerify('foo');

    // ASSERT
    expect(vm.recaptchaResponse).to.equal('foo');
  });
});