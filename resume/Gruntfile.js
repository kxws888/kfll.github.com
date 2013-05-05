module.exports = function(grunt) {
  var hogan = require('hogan.js')
    , clean = require('clean-css')

  grunt.config.init({
    convert: {
      options: {
        pkg: grunt.file.readJSON('resume.json')
      },
      html: { files: { 'index.html': 'src/template.html' } },
      markdown: { files: { 'README.md': 'src/template.md' } },
      en: { options: {pkg: grunt.file.readJSON('resume_en.json')}, files: { 'en.html': 'src/template_en.html' }}
    },
    cleancss: {
      css: {
        files: {
          'assets/main.css': ['src/base.css', 'src/head.css', 'src/custom_base.css',
                              'src/main.css', 'src/responsive.css', 'src/print.css']
        }
      }
    }
  })

  /* clean css */
  grunt.registerMultiTask('cleancss', function() {
    this.files.forEach(function(f) {
      cleaned = []
      f.src.forEach(function(path) {
        cleaned.push(clean.process(grunt.file.read(path)))
      })
      grunt.file.write(f.dest, cleaned.join('\n'))

    }, this)
  })

  /* convert */
  function parseValue(value, method) {
    if (method === 'html') {
      // parseLink
      value = value.replace(/\[\s*([^\]]*)\s*]\(([^\)]*)\)/g, function(raw, text, link) {
        // []()
        if (text + link === '') {
          return ''
        }
        // [](...)
        text = text || link
        // [...]()
        link = link || '.'
        return '<a href="' + link + '">' + text + '</a>' + 
               ['<code class="link-print" aria-hidden="true"> (' + link + ') </code>', ''][1 * (link === '.')]
      })
      // parseMultilineCode
      value = value.replace(/```(((?!```)[\S\s])*)```/g, '<pre>$1</pre>')
      // parseCode
      value = value.replace(/`([^`]*)`/g, function(raw, code) {
        return code ? '<code>' + code + '</code>' : '``'
      })

      return value
    }
    return value
  }

  function parseData(obj, method) {
    obj.items.forEach(function(item, index) {
      var raw = item['data'], parsed = []

      // `raw` is either `[object Object]` or `[object Array]`
      if (raw.length === undefined) {
        // key-value item
        item.is_kv = true

        if (item.sort) {
          item.sort.forEach(function(key) {
            parsed.push({"key": key, "value": parseValue(raw[key], method)})
          })
        } else {
          for (var key in raw) {
            parsed.push({"key": key, "value": parseValue(raw[key], method)})
          }
        }
      } else {
        // array item
        raw.forEach(function(value) {
          parsed.push(parseValue(value, method))
        })
      }

      item['data'] = parsed
      obj.items[index] = item
    })

    return obj
  }

  grunt.registerMultiTask('convert', function(resume_json) {
    this.files.forEach(function(f) {
      var json = parseData(this.options()['pkg'], f.dest.substr(-4))
        , template = hogan.compile(grunt.file.read(f.src[0]))

      grunt.file.write(f.dest, template.render(json))
    }, this)
  })

  /* default */
  grunt.registerTask('default', ['convert', 'cleancss'])
}
