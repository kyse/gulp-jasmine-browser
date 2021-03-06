require('../spec_helper');

describe('SpecRunner', () => {
  let $, fs, path, cssFiles, jsFiles, subject, SpecRunner;

  function loadJasmineFiles(...types) {
    const jasmineCore = require('jasmine-core');
    return types.map(type => {
      return jasmineCore.files[type].map(fileName => fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8'));
    });
  }

  beforeEach(() => {
    fs = require('fs');
    path = require('path');
    $ = require('cheerio');
    SpecRunner = require('../../dist/lib/spec_runner');
    const result = loadJasmineFiles('jsFiles', 'cssFiles');
    jsFiles = result[0];
    cssFiles = result[1];
  });

  describe('when the console true option is true', () => {
    let jsonStreamReporter, bootJs;

    beforeEach(() => {
      jsonStreamReporter = fs.readFileSync(require.resolve('jasmine-json-stream-reporter/browser.js'), 'utf8');
      bootJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'boot.js'), 'utf8');
      subject = new SpecRunner({console: true});
    });

    it('includes all of the Jasmine library files', () => {
      const html = subject.contents.toString();
      const $tags = $.load(html)('script,style,link');

      expect($tags.length).toBe(6);

      expect($tags.eq(0).is('style')).toBe(true);
      expect($tags.eq(0).html()).toBe(cssFiles[0]);

      expect($tags.eq(1).is('script')).toBe(true);
      expect($tags.eq(1).html()).toBe(jsFiles[0]);

      expect($tags.eq(2).is('script')).toBe(true);
      expect($tags.eq(2).html()).toBe(jsFiles[1]);

      expect($tags.eq(3).is('script')).toBe(true);
      expect($tags.eq(3).html()).toBe(jsFiles[2]);

      expect($tags.eq(4).is('script')).toBe(true);
      expect($tags.eq(4).html()).toBe(jsonStreamReporter);

      expect($tags.eq(5).is('script')).toBe(true);
      expect($tags.eq(5).html()).toBe(bootJs);
    });

    it('allows adding additional css and js files', () => {
      subject.addFile('foo.js');
      subject.addFile('bar.css');
      subject.addFile('foo.js');
      subject.addFile('bar.css');
      subject.addFile('bar.css');

      const html = subject.contents;
      const $tags = $.load(html)('script,style,link');

      expect($tags.length).toBe(8);

      expect($tags.eq(6).attr('src')).toBe('foo.js');
      expect($tags.eq(6).is('script')).toBe(true);

      expect($tags.eq(7).attr('href')).toBe('bar.css');
      expect($tags.eq(7).attr('type')).toBe('text/css');
      expect($tags.eq(7).attr('rel')).toBe('stylesheet');
      expect($tags.eq(7).is('link')).toBe(true);
    });

    describe('when profile is true', () => {
      let profileReporterJs;

      beforeEach(() => {
        profileReporterJs = fs.readFileSync(require.resolve('jasmine-profile-reporter/browser.js'), 'utf8');
        subject = new SpecRunner({profile: true});
      });

      it('includes all of the Jasmine library files', () => {
        const html = subject.contents.toString();
        const $tags = $.load(html)('script,style,link');

        expect($tags.length).toBe(7);

        expect($tags.eq(4).is('script')).toBe(true);
        expect($tags.eq(4).html()).toBe(profileReporterJs);
      });
    });
  });

  describe('when the console true option is not true', () => {
    let bootFiles;

    beforeEach(() => {
      bootFiles = loadJasmineFiles('bootFiles')[0];
    });

    describe('when the sourcemapped stacktrace is not true', () => {
      beforeEach(() => {
        subject = new SpecRunner();
      });

      it('includes all of the Jasmine library files', () => {
        const html = subject.contents.toString();
        const $tags = $.load(html)('script,style,link');

        expect($tags.length).toBe(5);

        expect($tags.eq(0).is('style')).toBe(true);
        expect($tags.eq(0).html()).toBe(cssFiles[0]);

        expect($tags.eq(1).is('script')).toBe(true);
        expect($tags.eq(1).html()).toBe(jsFiles[0]);

        expect($tags.eq(2).is('script')).toBe(true);
        expect($tags.eq(2).html()).toBe(jsFiles[1]);

        expect($tags.eq(3).is('script')).toBe(true);
        expect($tags.eq(3).html()).toBe(jsFiles[2]);

        expect($tags.eq(4).is('script')).toBe(true);
        expect($tags.eq(4).html()).toBe(bootFiles[0]);
      });
    });

    describe('when the sourcemapped stacktrace is true', () => {
      let sourcemappedStacktraceJs, sourceMappedStacktraceReporterCss, sourceMappedStacktraceReporterJs;

      beforeEach(() => {
        sourcemappedStacktraceJs = fs.readFileSync(require.resolve('sourcemapped-stacktrace/dist/sourcemapped-stacktrace.js'), 'utf8');
        sourceMappedStacktraceReporterCss = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'stylesheets', 'sourcemapped_stacktrace_reporter.css'), 'utf8');
        sourceMappedStacktraceReporterJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'reporters', 'add_sourcemapped_stacktrace_reporter.js'), 'utf8');
        subject = new SpecRunner({sourcemappedStacktrace: true});
      });

      it('includes all of the Jasmine library files', () => {
        const html = subject.contents.toString();
        const $tags = $.load(html)('script,style,link');

        expect($tags.length).toBe(8);

        expect($tags.eq(0).is('style')).toBe(true);
        expect($tags.eq(0).html()).toBe(cssFiles[0]);

        expect($tags.eq(1).is('style')).toBe(true);
        expect($tags.eq(1).html()).toBe(sourceMappedStacktraceReporterCss);

        expect($tags.eq(2).is('script')).toBe(true);
        expect($tags.eq(2).html()).toBe(jsFiles[0]);

        expect($tags.eq(3).is('script')).toBe(true);
        expect($tags.eq(3).html()).toBe(jsFiles[1]);

        expect($tags.eq(4).is('script')).toBe(true);
        expect($tags.eq(4).html()).toBe(jsFiles[2]);

        expect($tags.eq(5).is('script')).toBe(true);
        expect($tags.eq(5).html()).toBe(bootFiles[0]);

        expect($tags.eq(6).is('script')).toBe(true);
        expect($tags.eq(6).html()).toBe(sourcemappedStacktraceJs);

        expect($tags.eq(7).is('script')).toBe(true);
        expect($tags.eq(7).html()).toBe(sourceMappedStacktraceReporterJs);
      });
    });

    describe('when profile is true', () => {
      let addProfileReporterJs, profileReporterJs;

      beforeEach(() => {
        addProfileReporterJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'reporters', 'add_profile_reporter.js'), 'utf8');
        profileReporterJs = fs.readFileSync(require.resolve('jasmine-profile-reporter/browser.js'), 'utf8');
        subject = new SpecRunner({profile: true});
      });

      it('includes all of the Jasmine library files', () => {
        const html = subject.contents.toString();
        const $tags = $.load(html)('script,style,link');

        expect($tags.length).toBe(7);

        expect($tags.eq(0).is('style')).toBe(true);
        expect($tags.eq(0).html()).toBe(cssFiles[0]);

        expect($tags.eq(1).is('script')).toBe(true);
        expect($tags.eq(1).html()).toBe(jsFiles[0]);

        expect($tags.eq(2).is('script')).toBe(true);
        expect($tags.eq(2).html()).toBe(jsFiles[1]);

        expect($tags.eq(3).is('script')).toBe(true);
        expect($tags.eq(3).html()).toBe(jsFiles[2]);

        expect($tags.eq(4).is('script')).toBe(true);
        expect($tags.eq(4).html()).toBe(profileReporterJs);

        expect($tags.eq(5).is('script')).toBe(true);
        expect($tags.eq(5).html()).toBe(bootFiles[0]);

        expect($tags.eq(6).is('script')).toBe(true);
        expect($tags.eq(6).html()).toBe(addProfileReporterJs);
      });
    });
  });
});