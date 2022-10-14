# Squat

## Install required node packages

    npm install

## Run in local env

    npm run start

## Build and run production version

    npm run build
    serve -s build

## Embed into page using iframe

    <!doctype html>
    <html>
      <body>
        <!-- Squat calculator can be embedded into any page by using html iframe. -->
        <iframe id="squatIframe" name="squatIframe" src="http://localhost:3000?showLanguages=false" style="width: 100%; height: 2000px; border: none;" allow="clipboard-write"></iframe>

        <!-- Squat calculator language can be changed by changing url. Iframe url can be changed using standard html links. -->
        <ul>
          <li>
            <a href="http://localhost:3000/fi?showLanguages=false" target="squatIframe">suomeksi</a>
          </li>
          <li>
            <a href="http://localhost:3000/sv?showLanguages=false" target="squatIframe">På svenska</a>
          </li>
          <li>
            <a href="http://localhost:3000/en?showLanguages=false" target="squatIframe">In English</a>
          </li>
        </ul>

        <!-- Pass url params to iframe from parent window, baseURL is used creating shareable link and named field values to adjust default values. -->
        <script>
          const baseURL = window.location.href.split('?')[0];
          document.getElementById("squatIframe").src = "http://localhost:3000/" + (window.location.search.length? window.location.search + "&" : "?") + "showLanguages=false&baseURL=" + baseURL;
          // Reset current url
          window.history.replaceState(null, document.title, baseURL);
        </script>

        <!-- TODO: adjust iframe height based on content? -->
      </body>
    </html>
