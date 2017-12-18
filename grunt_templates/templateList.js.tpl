/*THIS FILE IS AUTO_GENERATED!*/
<% _.forEach(templates, function(template) { %>const <%- template.id %> = require('!!raw-loader!./templates/<%- template.filename %>');
<% }); %>


export default function getTemplateString(templateId) {
    switch (templateId) {
        <% _.forEach(templates, function(template) { %>case '<%- template.id %>':
            return <%- template.id %>;
        <% }); %>
        default:
           return null;
    }
}