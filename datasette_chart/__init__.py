from datasette import hookimpl
import json

@hookimpl
def extra_js_urls(datasette, database, table, view_name, request):
    return [
        "/-/static-plugins/datasette_chart/chart.min.js",
        "/-/static-plugins/datasette_chart/chart.js"
    ]

@hookimpl
def extra_body_script(template, database, table, columns, view_name, request, datasette):
    """Pass plugin configuration to JavaScript"""
    print(f"Template: {template}")
    print(f"Database: {database}")
    print(f"Table: {table}")
    print(f"View name: {view_name}")
    print(f"Request path: {request.path}")
    
    # Check if this is a table or query page
    if template in ["table.html", "query.html"]:
        
        # Get plugin configuration
        plugin_config = datasette.plugin_config("datasette-chart") or {}
    
        path_parts = request.path.strip('/').split('/')
        
        # Check if this is a canned query (path like /database/query_name)
        if len(path_parts) >= 2 and path_parts[0] == database:
            query_name = path_parts[1]
            
            # Check if this query name exists in metadata
            try:
                metadata = datasette.metadata()
                query_config = {}
                
                if database in metadata.get("databases", {}):
                    db_metadata = metadata["databases"][database]
                    if "queries" in db_metadata and query_name in db_metadata["queries"]:
                        
                        # This is a canned query - get query-specific config
                        query_metadata = db_metadata["queries"][query_name]
                        print(f"Found query metadata for '{query_name}': {query_metadata}")
                        
                        if "plugins" in query_metadata and "datasette-chart" in query_metadata["plugins"]:
                            query_config = query_metadata["plugins"]["datasette-chart"]
                            print(f"Found plugin config for query '{query_name}': {query_config}")
                
                # Merge global config with query-specific config (query config takes precedence)
                final_config = {**plugin_config, **query_config}
                
            except Exception as e:
                print(f"Error getting query config for {query_name}:", e)
                final_config = plugin_config
        else:
            # Regular table - use table-specific or global config
            final_config = plugin_config
            print(f"Using table config for '{table}':", final_config)
        
        # Return JavaScript that sets the global variable
        return f"""
        window.chartPluginConfig = {json.dumps(final_config)};
        console.log('Plugin config loaded via extra_body_script:', window.chartPluginConfig);
        """
    return ""


    
