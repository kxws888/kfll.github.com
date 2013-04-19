# {{meta.title}}

应聘岗位：{{meta.job}}

{{#items}}
# {{title}}

  {{#data}}
    {{#is_kv}}
- {{key}}: {{value}}
    {{/is_kv}}
    {{^is_kv}}
- {{.}}
    {{/is_kv}}
  {{/data}}

{{/items}}