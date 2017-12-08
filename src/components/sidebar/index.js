import L from 'leaflet';
import * as _ from 'underscore';

import './L.Knreise.Control.Sidebar';

import {getDatasetTemplate, getTemplate} from '../../util';

export default function setupSidebar(map, options) {
    options = options || {};
    var popupTemplate = getDatasetTemplate('popup');
    var listElementTemplate = getTemplate('list_item_template');
    var markerTemplate = getTemplate('marker_template');
    var thumbnailTemplate = getTemplate('thumbnail_template');
    var footerTemplate = getTemplate('footer_template');

    var sidebarOptions = _.extend({}, {
        position: 'left',
        template: popupTemplate,
        listElementTemplate: listElementTemplate,
        markerTemplate: markerTemplate,
        thumbnailTemplate: thumbnailTemplate,
        footerTemplate: footerTemplate
    }, options);

    //the sidebar, used for displaying information
    var sidebar = L.Knreise.Control.sidebar('sidebar', sidebarOptions);
    map.addControl(sidebar);
    return sidebar;
}