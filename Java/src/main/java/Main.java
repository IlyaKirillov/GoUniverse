package go.universe.jar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.bridge.SLF4JBridgeHandler;

import javafx.application.Application;
import javafx.application.HostServices;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.stage.Stage;
import javafx.scene.Parent;
import javafx.scene.Group;
import javafx.scene.Scene;

public class Main extends Application{

	final static Logger logger = LoggerFactory.getLogger(Main.class);

	private String version = "1.3.3";
	private Controller controller;

	public static void main(String... args) 
	{
		SLF4JBridgeHandler.removeHandlersForRootLogger();
		SLF4JBridgeHandler.install();
		Application.launch(args);
	}

	@Override
	public void start(Stage stage) throws Exception{

		FXMLLoader loader = new FXMLLoader(this.getClass().getResource("Main.fxml"));

		Parent root = loader.load();
		root.getStylesheets().add(this.getClass().getResource("Main.css").toExternalForm());
		controller = (Controller)loader.getController();
		Scene scene = new Scene(root, 350, 250);
		stage.setTitle("Go Universe " + version + "	");
		stage.setScene(scene);
		stage.show();
		controller.start();
	}

	@Override
	public void stop() throws Exception{
		controller.stop();
	}

}

