package controllers;

import org.pac4j.play.java.RequiresAuthentication;
import org.pac4j.play.java.UserProfileController;
import org.pac4j.core.profile.CommonProfile;

import org.pac4j.http.client.indirect.FormClient;
import org.pac4j.core.profile.CommonProfile;
import play.data.Form;
import play.mvc.*;
import play.twirl.api.Html;
import de.htwg.se.minesweeper.Minesweeper;
import de.htwg.se.aview.gui.PlayingFieldPanel;
import de.htwg.se.controller.IController;
import de.htwg.se.model.IField;
import de.htwg.se.model.impl.Field;
import de.htwg.se.util.observer.Event;
import de.htwg.se.util.observer.IObserver;
import views.html.*;
import play.libs.Json;
import java.util.Map;
import java.util.HashMap;
import akka.actor.*;
import play.libs.F.*;

public class Application extends UserProfileController<CommonProfile> {

	private HashMap<String, Minesweeper> userMsInstanceMap = new HashMap<String, Minesweeper>();

	@RequiresAuthentication(clientName = "FacebookClient,GitHubClient,FormClient")
  public Result index() {
		Minesweeper minesweeper = getMsInstanceFromUser();
		IController controller = minesweeper.getTui().getController();
    return ok(views.html.index.render("Minesweeper", controller, getLoginStatus()));
  }

	@RequiresAuthentication(clientName = "FacebookClient,GitHubClient,FormClient")
	public Result angular()	{
		return redirect(controllers.routes.Assets.at("html/minesweeper.html"));
	}

	@RequiresAuthentication(clientName = "FacebookClient,GitHubClient,FormClient")
	public Result polymer()	{
		return redirect(controllers.routes.Assets.at("polymer/index.html"));
	}

  public Result commandline(String command) {
		Minesweeper minesweeper = getMsInstanceFromUser();
		IController controller = minesweeper.getTui().getController();
  	minesweeper.getTui().processInputLine(command);
		if (controller.isVictory()) {
			command = "Victory!";
		} else if (controller.isGameOver()) {
			command = "Game Over!";
		} else {
			command = "You typed: " + command;
		}
  	return ok(views.html.index.render(command, controller, getLoginStatus()));
  }

	public Result about() {
		return ok(views.html.about.render(getCallbackUrlFormClient(), getLoginStatus()));
	}

	public Result license() {
		return ok(views.html.license.render());
	}

	public Result authors() {
		return ok(views.html.authors.render());
	}

	public Result json() {
		return ok(jsonStr());
	}

	private String jsonStr() {
		Minesweeper minesweeper = getMsInstanceFromUser();
		return jsonStr(minesweeper);
	}

	private String jsonStr(Minesweeper minesweeper) {
		IController controller = minesweeper.getTui().getController();

		int x = controller.getPlayingField().getLines();
		int y = controller.getPlayingField().getColumns();
		Map<String, Object> field[][] = new HashMap[x][y];
		for (int i=0; i < x; i++) {
			for (int j=0; j < y; j++) {
				field[i][j] = new HashMap<String, Object>();
				field[i][j].put("value", new Integer(controller.getPlayingField().getCell(i+1, j+1).getValue()));
				field[i][j].put("isrevealed", new Boolean(controller.getPlayingField().getCell(i+1, j+1).isRevealed()));
				field[i][j].put("row", new Integer(i+1));
				field[i][j].put("column", new Integer(j+1));

			}
		}

		Map<String, Object> json = new HashMap<String, Object>();
		json.put("victory", new Boolean(controller.isVictory()));
		json.put("loose", new Boolean(controller.isGameOver()));
		json.put("field", field);
		return Json.stringify(Json.toJson(json));
	}

	public Result revealField(int row, int column) {
		Minesweeper minesweeper = getMsInstanceFromUser();
		IController controller = minesweeper.getTui().getController();
		if (row < 10 && column < 10) {
			minesweeper.getTui().processInputLine("0" + row + "-0" + column);
		} else if (row < 10 && column >= 10) {
			minesweeper.getTui().processInputLine("0" + row + "-" + column);
		} else if (row >= 10 && column < 10) {
			minesweeper.getTui().processInputLine(row + "-0" + column);
		} else {
			minesweeper.getTui().processInputLine(row + "-" + column);
		}
		return json();
	}

    public WebSocket<String> sockHandler() {
			Minesweeper minesweeper = getMsInstanceFromUser();
			IController controller = minesweeper.getTui().getController();
			String loginStatus = getLoginStatus();

			return new WebSocket<String>() {
          // called when the websocket is established
          public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
              // register a callback for processing instream events
              in.onMessage(new Callback<String>() {
                  public void invoke(String event) {
											System.out.println(event);
                      minesweeper.getTui().processInputLine(event);
											String test = jsonStr(minesweeper);
                      out.write(test);
                }
             });
						 out.write(loginStatus);
						 out.write(jsonStr(minesweeper));
        }
    	};
  	}

	@RequiresAuthentication(clientName = "FacebookClient")
  public Result signInFacebook() {
		return ok(views.html.about.render(getCallbackUrlFormClient(), getLoginStatus()));
	}

	@RequiresAuthentication(clientName = "GitHubClient")
  public Result signInGithub() {
		return ok(views.html.about.render(getCallbackUrlFormClient(), getLoginStatus()));
	}

	public Result signInLogin() {
    return ok(views.html.about.render(getCallbackUrlFormClient(), getLoginStatus()));
	}

	private String getCallbackUrlFormClient()	{
		final FormClient formClient = (FormClient) config.getClients().findClient("FormClient");
		return formClient.getCallbackUrl();
	}

	private String getLoginStatus()	{
		CommonProfile profile = getUserProfile();
		if(profile == null)	{
			return "Not logged in";
		}
		if(profile instanceof org.pac4j.http.profile.HttpProfile)	{
			return "Logged in as " + profile.getUsername();
		}
		if(profile instanceof org.pac4j.oauth.profile.OAuth20Profile)	{
			return "Logged in as " + profile.getDisplayName();
		}
		return "Something went wrong";
	}

	private Minesweeper getMsInstanceFromUser()	{
		CommonProfile profile = getUserProfile();
		if(profile == null)	{
			return null;
		}
		String userId = profile.getId();
		return getMsInstanceFromUser(userId);
	}

	private Minesweeper getMsInstanceFromUser(String userId)	{
		if(userMsInstanceMap.containsKey(userId))	{
			return userMsInstanceMap.get(userId);
		}
		userMsInstanceMap.put(userId, Minesweeper.getInstance());
		return userMsInstanceMap.get(userId);
	}
}
