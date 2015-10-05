using FilePicker.Utils;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.Office365.Discovery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace FilePicker.Controllers
{
    public class MediaController : Controller
    {
        // GET: Media
        public async Task<ActionResult> Index()
        {
            // create O365 discovery client 
            DiscoveryClient discovery = new DiscoveryClient(new Uri(SettingsHelper.DiscoveryEndpoint),
                async () =>
                {
                    var authResult = await GetAccessToken(SettingsHelper.DiscoveryResource);
                    return authResult.AccessToken;
                });

            // query discovery service for endpoint for 'RootSite' endpoint
            var dcrRoot = await discovery.DiscoverCapabilityAsync("RootSite");
            var dcrMy = await discovery.DiscoverCapabilityAsync("MyFiles");

            // get access token for the RootSite
            var rootToken = await GetAccessToken(dcrRoot.ServiceResourceId);
            var myToken = await GetAccessToken(dcrMy.ServiceResourceId);

            //set details in ViewData
            ViewData["RootToken"] = rootToken.AccessToken;
            ViewData["RootEndpoint"] = dcrRoot.ServiceEndpointUri;
            ViewData["MyToken"] = myToken.AccessToken;
            ViewData["MyEndpoint"] = dcrMy.ServiceEndpointUri;

            return View();
        }

        private async Task<AuthenticationResult> GetAccessToken(string resource)
        {
            AuthenticationContext context = new AuthenticationContext(SettingsHelper.AzureADAuthority);
            var clientCredential = new ClientCredential(SettingsHelper.ClientId, SettingsHelper.ClientSecret);
            AuthenticationResult result = (AuthenticationResult)this.Session[SettingsHelper.UserTokenCacheKey];
            return await context.AcquireTokenByRefreshTokenAsync(result.RefreshToken, clientCredential, resource);
        }
    }
}