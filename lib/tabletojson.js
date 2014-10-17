var Q = require('q');
var cheerio = require('cheerio');
var request = require('request');
var isClass = false;
exports.convert = convert;

function convert(html, _id, _isClass) {

    var jsonResponse = [];
    var selector = 'table ' + _id;
    if (_id.indexOf('.') > -1) {
        selector = 'table' + _id;
    }
    var $ = cheerio.load(html);

    // if (isClass) selector= "table"+"."+selector;
    // else selector="table #"+selector;
    var columnHeadings = [];
    var columnHeadingstnp = [];
    //console.log($(selector));
    $(selector).each(function (i, table) {

        if ($(table).children('thead').length>0) {  // ENAGAS
            $(table).children('thead').each(function(z,thead){
              $(thead).children('tr').each(function (i, tr) {
                columnHeadingstnp = [];
                
                $(tr).children('td').each(function (z, cell) {
                    columnHeadingstnp[0] = $(cell).text().trim();

                });
                var ind=1; 
                $(tr).children('th').each(function (j, cell) {
                  var title=''
                  title=$(cell).find('span.head2').text().trim()+":"+$(cell).find('span.head3').text().trim()+":";  
                  
                    columnHeadingstnp[ind]=title;
                    $(cell).children('span').each(function (x, sp){
                        //columnHeadingstnp[ind]+=$(sp).text().trim();
                        if (sp.attribs.class==='head1'){
                         // console.log($(sp).children('span').length);
                          if ($(sp).children('span').length<2){
                            columnHeadingstnp[ind]+= $(sp).text().trim();
                            ind++;
                            
                          }
                          else {    
                            var childs=$(sp).children('span');
                            columnHeadingstnp[ind]+= $(childs[0]).text().trim();
                            ind++;
                            columnHeadingstnp[ind]+=title+ $(childs[1]).text().trim();
                            ind++;
                            
                          }
                         
                        }
                      //   else {
                      //   $(sp).children('span').each(function(y,sp2){
                      //       columnHeadingstnp[ind]= $(sp2).text().trim();
                      //     ind++;
                      //   });
                      // }
                    });
                   

                }); 
                if (columnHeadingstnp.length > 0) columnHeadings.push(columnHeadingstnp);
             });
            });
          }
        else { // MEFF
        $(table).children('tr').each(function (i, tr) {
            columnHeadingstnp = [];
            //console.log('trs');
            $(tr).children('th').each(function (j, cell) {

                columnHeadingstnp[j] = $(cell).text().trim();




            });
            if (columnHeadingstnp.length > 0) columnHeadings.push(columnHeadingstnp);
        });
        if (columnHeadings.length === 2) {
            var l1 = columnHeadings[0].length - 1;
            var l2 = columnHeadings[1].length;
            var order = l2 / l1;
            //console.log(order + " " + l2 + " " + l1);
            columnHeadings[1].forEach(function (el, t) {


                columnHeadings[1][t] = columnHeadings[0][Math.floor(t / order) + 1] + "." + el;
                //console.log(el);

            });

        }
        columnHeadings[1].filter(function(el,i){
            if (el!=="BASE" && el!=="PUNTA") return el;
        })

      }
      });
    
    if (columnHeadings.length === 2) columnHeadings[1].unshift('date');
    //console.log(columnHeadings[0]);
    // console.log(columnHeadings[1]);
    if(columnHeadings.length===1){ //ENAGAS
       $(selector + ' tr').each(function (i, tr) {
        var tableAsJson = [];
        // Get column headings
        // @fixme Doesn't support vertical column headings.
        // @todo Try to support badly formated tables.


        var rowAsJson = [];
        //console.log($(tr).children('th'));
        try {

            var idx = columnHeadings.length - 1;
            if ($(tr).find('th').next('td').length===0){
              $(tr).children('td').each(function (j, cell) {
                if (columnHeadings[idx][j]) {
                    //console.log(columnHeadings[idx][j]);
                    rowAsJson[columnHeadings[idx][j]] = $(cell).text().trim();
                } else {
                    rowAsJson[j] = $(cell).text().trim();
                }
            });
           }
           else {
              $(tr).children('th').each(function (j, cell) {
                if (columnHeadings[idx][j]) {
                    //console.log(columnHeadings[idx][j]);
                    rowAsJson[columnHeadings[idx][j]] = $(cell).text().trim();
                } else {
                    rowAsJson[j] = $(cell).text().trim();
                }
              });
               $(tr).children('td').each(function (j, cell) {
                if (columnHeadings[idx][j+1]) {
                    //console.log(columnHeadings[idx][j]);
                    if ($(cell).text().trim().indexOf('swf')>=0)
                          rowAsJson[columnHeadings[idx][j+1]] ='';
                    else  
                        rowAsJson[columnHeadings[idx][j+1]] = $(cell).text().trim();
                } else {
                    rowAsJson[j+1] = $(cell).text().trim();
                }
              });
           
           }
        } catch (e) {
            console.log(e);
        }
        // NORMALIZE JSON TO DUE HAVE A SAME SCHEMA

        for ( row in rowAsJson){

          
            columnHeadings[0].forEach(function(head,j){
              // console.log(head);
                if (rowAsJson[head]===undefined) rowAsJson[head]='';
            });
        };
        if (i>1)jsonResponse.push(
             rowAsJson
        );

      });
    }
    else { // MEFF
    $(selector + ' tr').each(function (i, tr) {
        var tableAsJson = [];
        // Get column headings
        // @fixme Doesn't support vertical column headings.
        // @todo Try to support badly formated tables.


        var rowAsJson = [];
        //console.log($(tr).children('th'));
        try {

            var idx = columnHeadings.length - 1;
            $(tr).children('td').each(function (j, cell) {
                if (columnHeadings[idx][j]) {
                    //console.log(columnHeadings[idx][j]);
                    rowAsJson[columnHeadings[idx][j]] = $(cell).text().trim();
                } else {
                    rowAsJson[j] = $(cell).text().trim();
                }
            });
        } catch (e) {
            console.log(e);
        }
        for ( row in rowAsJson){

          
            columnHeadings[0].forEach(function(head,j){
                //console.log(head);
                if (rowAsJson[head]===undefined) rowAsJson[head]='';
            });
        };
        if (i>1)jsonResponse.push(
             rowAsJson
        );
    });
  }
    return jsonResponse;
}

function convertMultipletables(html, _id, _isClass) {
    //console.log(_id + ' table');
    var jsonResponse = [];
    var $ = cheerio.load(html);
    var columnHeadings;
    var kopt=0;
    $('table').each(function (i, table) {
        var tableAsJson = [];
        var tablename='';
        //console.log(_id);
        //console.log('table');
        // Get column headings
        // @fixme Doesn't support vertical column headings.
        // @todo Try to support badly formated tables.
        columnHeadings = [];
        //console.log(table.children['tbody']);

        if ($(table).find('thead').length > 0) {
            var sel = 'thead';
        } else var sel = 'tbody'
        if (sel === 'thead') {
            var thead=$(table).children('thead')[0];
            tablename=$(thead).children('tr:first-child').children('td:first-child').text().trim();
            tablename=tablename.replace(/ /g, "_");
            tablename=removeEspecialChar(tablename);
           
            $(table).children(sel).each(function (i, tbody) {
                var columnHeadingstmp = [];
                $(tbody).children('tr').each(function (z, row) {
                    // console.log('row');

                    $(row).children().each(function (j, cell) {
                        //console.log($(cell).text());

                        columnHeadingstmp[j] = $(cell).text().trim();

                    });

                });
                columnHeadings.push(columnHeadingstmp);
            });
        } else { //REE
            
            var h2=$(table).prev();
            if (h2[0].name==="h2") 
                {
                    tablename=$(h2).text().trim();
                    tablename=tablename.replace(/ /g, "_");
                    tablename=removeEspecialChar(tablename);
                }
            else {
                h2=$(table).prev().prev();
                tablename=$(h2).text().trim();
                tablename=tablename.replace(/ /g, "_");
                 tablename=removeEspecialChar(tablename);
            }
           
            $(table).children(sel).each(function (i, tbody) {
                var columnHeadingstmp = [];

                $(tbody).children('tr:first-child').each(function (z, row) {
                    // console.log('row');
                    $(row).children('th').each(function (j, cell) {


                        columnHeadingstmp[j] = $(cell).text().trim();

                    });
                });
                columnHeadings.push(columnHeadingstmp);
            });
        }
        // console.log(columnHeadings);
        // USE LAST HEADING FOR INDEXING VALUES
        var idx = columnHeadings.length - 1;

        // Fetch each row
        $(table).children('tbody').each(function (i, tbody) {

            $(tbody).children('tr').each(function (z, row) {
                var rowAsJson = {};
                if ($(row).find('th').next('td').length > 0) {
                   // console.log(columnHeadings[idx][0]);
                    rowAsJson[columnHeadings[idx][0]] = $(row).find('th').text().trim();
                    $(row).children('td').each(function (j, cell) {

                        if (columnHeadings[idx][j + 1]) {

                            rowAsJson[columnHeadings[idx][j + 1]] = $(cell).text().trim();
                        } else {
                            rowAsJson[j + 1] = $(cell).text().trim();
                        }
                    });
                    var collength = columnHeadings[idx].length;
                    rowAsJson[columnHeadings[idx][collength - 1]] = $(row).children('td:last-child').text().trim();
                } else { // ENAGAS
                    $(row).children('td').each(function (j, cell) {
                        //console.log(columnHeadings[idx][j]);
                        if (columnHeadings[idx][j]) {

                            rowAsJson[columnHeadings[idx][j]] = $(cell).text().trim();
                        } else {
                            rowAsJson[j] = $(cell).text().trim();
                        }
                    });
                }
          
              if ($(row).children('td').length!==0)tableAsJson.push(rowAsJson);
              
            });


            // Skip blank rows
            //if (JSON.stringify(rowAsJson) != '{}')

            //console.log(rowAsJson);
        });

        // Add the table to the response
        try {
            var title = $(table).parent().prev().children('span')[0].children[0].data;
            title=removeEspecialChar(title);
        } catch (e) {
            tablename=title = "_sub"+kopt;
            //console.log("Error: "+e.toString()+" line 339 in tabletojson.js");
            if (tableAsJson.length != 0) {
            jsonResponse.push({
                "data": tableAsJson,
                "title": title,
                "tablename":tablename
            });
             kopt++;
         }
        }
        if (tableAsJson.length != 0) {
            jsonResponse.push({
                "data": tableAsJson,
                "title": title,
                "tablename":tablename
            });
             kopt++;
        }
        //console.log(columnHeadings);
       
    });
    //console.log("kopt:"+kopt);
    return jsonResponse;
}
exports.convertUrl = function (url, _id, multi, callback,scope) {

    if (typeof (callback) === "function") {
        // Use a callback (if passed)
        fetchUrl(url)
            .then(function (html) {
                callback.call(this, convert(html, _id, _isClass) );
            });
    } else {
        // If no callback, return a promise
        return fetchUrl(url)
            .then(function (html) {
                if (multi) return convertMultipletables(html, _id);
                return convert(html, _id);
            });
    }
}

function fetchUrl(url, callback) {
    var deferred = Q.defer();
    request(url, function (error, response, body) {
        deferred.resolve(body);
    });
    return deferred.promise;
}
function removeEspecialChar(s){
                        var r=s.toLowerCase();
                        r = r.replace(new RegExp("\\s", 'g'),"");
                        r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
                        r = r.replace(new RegExp("æ", 'g'),"ae");
                        r = r.replace(new RegExp("ç", 'g'),"c");
                        r = r.replace(new RegExp("[èéêë]", 'g'),"e");
                        r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
                        r = r.replace(new RegExp("ñ", 'g'),"n");                            
                        r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
                        r = r.replace(new RegExp("œ", 'g'),"oe");
                        r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
                        r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
                        r = r.replace(new RegExp("\\W", 'g'),"");
                        return r;
                };
