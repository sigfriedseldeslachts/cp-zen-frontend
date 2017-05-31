import Vue from 'vue';
import dojoDetails from '!!vue-loader?inject!@/dojos/cd-dojo-details';

function setUpDojoDetailsComponent(mockBody) {
  const mock = {
    getByUrlSlug: (/* urlSlug */) => Promise.resolve({ body: mockBody }),
  };
  const dojoDetailsWithMocks = dojoDetails({
    './service': mock,
  });
  return dojoDetailsWithMocks;
}

describe('Dojo details component', () => {
  const dojoDetailsWithAddress =
    {
      id: 1,
      name: 'Dublin Ninja Kids',
      location: 'Dublin',
      address1: 'CHQ',
      placeName: 'Dublin',
      countryName: 'Ireland',
    };

  const dojoDetailsWithoutAddress =
    {
      id: 1,
      name: 'Dublin Ninja Kids',
      location: 'Dublin',
    };

  it('should show dojo details', (done) => {
    const DojoDetailsWithMock = setUpDojoDetailsComponent(dojoDetailsWithAddress);
    const vm = new Vue(DojoDetailsWithMock);

    vm.loadDojoDetails();
    requestAnimationFrame(() => {
      expect(vm.dojoDetails).to.deep.equal(dojoDetailsWithAddress);
      done();
    });
  });

  it('should build the urlSlug from path parameters', () => {
    const DojoDetailsWithMock = setUpDojoDetailsComponent(dojoDetailsWithAddress);

    const urlParts = {
      country: 'za',
      region: 'gauteng',
      dojoName: 'johannesburg-rock-stars',
    };

    const urlSlug = DojoDetailsWithMock.computed.urlSlug.bind(urlParts)();
    expect(urlSlug).to.equal('za/gauteng/johannesburg-rock-stars');
  });

  describe('computed.address()', () => {
    it('should return undefined when address1 is falsey', () => {
      const DojoDetailsWithMock = setUpDojoDetailsComponent(dojoDetailsWithoutAddress);
      const mockDojoDetails = {};
      const address = DojoDetailsWithMock.computed.address.bind({ dojoDetails: mockDojoDetails })();
      expect(address).to.be.undefined;
    });

    it('should return computed address when address1 is truthy', () => {
      const DojoDetailsWithMock = setUpDojoDetailsComponent(dojoDetailsWithAddress);
      const mockDojoDetails = {
        address1: 'CHQ',
        placeName: 'Dublin',
        countryName: 'Ireland',
      };
      const address = DojoDetailsWithMock.computed.address.bind({ dojoDetails: mockDojoDetails })();
      expect(address).to.not.be.undefined;
    });
  });
});