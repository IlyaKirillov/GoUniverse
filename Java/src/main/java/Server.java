package go.universe.jar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.catalina.Host;

import org.apache.catalina.WebResourceRoot;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.core.StandardHost;
import org.apache.catalina.startup.ContextConfig;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.JarResourceSet;
import org.apache.catalina.webresources.StandardRoot;
import org.apache.tomcat.util.scan.StandardJarScanner;
import org.apache.tomcat.JarScanFilter;
import org.apache.tomcat.JarScanType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;

import javafx.concurrent.Service;
import javafx.concurrent.Task;

public class Server{

	final static Logger logger = LoggerFactory.getLogger(Server.class);

	private int port = 9000;
	private Tomcat tomcat ;

	public Server(){
	}

	public int getPort(){
		return this.port;
	}

	public void setPort(int port){
		this.port = port;
	}

	public boolean isRunning(){
		return (null != tomcat);
	}

	public boolean stop(){
		try{
			if(tomcat != null){
    		    tomcat.stop();
    		    tomcat.destroy();
				System.out.format("GoUniverse stopped at http://localhost:%d%n", port);
			}
		}catch(Exception e){
            logger.error(e.getMessage(), e);
			return false;
		}finally{
			tomcat = null;
		}
		return true;
	}

	public boolean start()
	{
		if(null ==tomcat){
			try{
				File working= Files.createTempDirectory("GoUniverse-" + port + "-") .toFile();
				working.deleteOnExit();

				tomcat = new Tomcat();
				tomcat.setBaseDir(working.getAbsolutePath().toString());

				StandardHost host =  (StandardHost) tomcat.getHost();
				StandardContext context = new StandardContext();
				context.setPath("");
				ContextConfig config = new ContextConfig();
				context.addLifecycleListener(config);
				host.addChild(context);

				WebResourceRoot resources = new StandardRoot(context);

				String war  = Paths.get(Server.class.getProtectionDomain()
					 .getCodeSource().getLocation().toURI())
							.toAbsolutePath().toString();

				resources.addPreResources(new JarResourceSet(resources, "/",war, "/"));
				context.setResources(resources);

				tomcat.setPort(port);
				tomcat.start();

				System.out.format("GoUniverse started at http://localhost:%d%n", port);

                return true;
			}catch(Exception e){

                logger.error(e.getMessage(), e);
				tomcat = null;
			}
		}
		return false;
	}

}



