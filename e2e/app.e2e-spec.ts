import { ScratchPage } from './app.po';

describe('scratch App', () => {
  let page: ScratchPage;

  beforeEach(() => {
    page = new ScratchPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
