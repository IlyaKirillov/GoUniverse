package go.universe.jar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javafx.fxml.FXML;

import javafx.geometry.Insets;

import javafx.scene.layout.GridPane;

import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;

import javafx.scene.text.Text;

import javafx.event.ActionEvent;

import java.util.prefs.Preferences;

public class Controller {

	final static Logger logger = LoggerFactory.getLogger(Controller.class);

	@FXML private TextField url;
	@FXML private TextField port;
	@FXML private Label status;
	@FXML private Button stopstart;

	private Server server = new Server();

	public Controller(){
	}
	 
	@FXML
	public void initialize() {
		server.setPort(readPort());
		port.setText(Integer.toString(server.getPort()));
	}

	private int readPort(){
		int value = 9000;

		try{
			value =	Integer.parseInt(port.getText(),10);
		}catch(Exception e){
		}

		try{
			Preferences prefs = Preferences.userRoot().node(Main.class.getName());
			value = prefs.getInt("port", value);
		}catch(Exception e){
		}
		return value;
	}

	private void writePort(){
        try{
		    Preferences prefs = Preferences.userRoot().node(Main.class.getName());
		    prefs.putInt("port", server.getPort());
        }catch(Exception e){

        }
	}

 	@FXML
  private void onStopStart(ActionEvent event) {

		if(server.isRunning()){
			stop();
		}else{
			start();
		}
	}

	public void start(){

		try{
			server.setPort(Integer.parseInt(port.getText()));
		}catch(Exception e){
		}
		
		if(server.start()){
			status.setText("Running");
			stopstart.setText("Stop");
			port.setText(Integer.toString(server.getPort()));
			url.setText("http://localhost:" +  server.getPort());
			writePort();
		}	
	}
	public void stop(){
		if(server.isRunning()){
			server.stop();
			status.setText("Stopped");
			stopstart.setText("Start");
			url.setText("");
		}
	}
}
