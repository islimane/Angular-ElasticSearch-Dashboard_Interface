import { DashboardInterfacePage } from './app.po';

describe('dashboard-interface App', () => {
  let page: DashboardInterfacePage;

  beforeEach(() => {
    page = new DashboardInterfacePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
