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
        <iframe name="squat-iframe" src="http://localhost:3000?showHeader=false" style="width: 100%; height: 500px;"></iframe>

        <!-- Squat calculator language can be changed by changing url. Iframe url can be changed using standard html links. -->
        <ul>
          <li>
            <a href="http://localhost:3000/fi?showHeader=false" target="squat-iframe">suomeksi</a>
          </li>
          <li>
            <a href="http://localhost:3000/sv?showHeader=false" target="squat-iframe">På svenska</a>
          </li>
          <li>
            <a href="http://localhost:3000/en?showHeader=false" target="squat-iframe">In English</a>
          </li>
        </ul>
      </body>
    </html>
