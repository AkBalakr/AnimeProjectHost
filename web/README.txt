Installation Instructions:

If this is the first time running:
- Run "npm install" in both the client and server folders. 
- Install python
- Pip install Pandas and scikit-learn packages

To run the WebAPP: 
1) Start the Flask server by typing python3 flaskServer.py in the console. 
    - Wait for the server to fully start up. It should display Running on http://127.0.0.1:7000. 
2) Type ./startClientAndServer.bat in the console. 
    - Alternatively, you can manually start the front and back end. To do this:
        1) Navigate to the server folder (cd cse115-animeAI/web/server) and type "npm run dev"  to start backend.
        2) Navigate to the client folder (cd cse115-animeAI/web/client) and type "npm start" in client folder to start the React web page.
