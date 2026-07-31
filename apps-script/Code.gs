function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('電気工事ツール')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
