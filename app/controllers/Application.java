package controllers;

import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;
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

public class Application extends Controller {
	private Minesweeper minesweeper = Minesweeper.getInstance();
	private IController controller = minesweeper.getTui().getController();
  public Result index() {
		System.out.println(json());
    return ok(views.html.index.render("Minesweeper", controller));
  }

  public Result commandline(String command) {
  	minesweeper.getTui().processInputLine(command);
		if (controller.isVictory()) {
			command = "Victory!";
		} else if (controller.isGameOver()) {
			command = "Game Over!";
		} else {
			command = "You typed: " + command;
		}
  	return ok(views.html.index.render(command, controller));
  }

	public Result about() {
		return ok(views.html.about.render());
	}

	public Result license() {
		return ok(views.html.license.render());
	}

	public Result authors() {
		return ok(views.html.authors.render());
	}

	public Result jsonCommand(String command) {
			minesweeper.getTui().processInputLine(command);
			return json();
	}

	public Result json() {
		int x = controller.getPlayingField().getLines();
		int y = controller.getPlayingField().getColumns();
		Map<String, Object> field[][] = new HashMap[x][y];

		for (int i=0; i < x; i++) {
			for (int j=0; j < y; j++) {
				field[i][j] = new HashMap<String, Object>();
				field[i][j].put("value", new Integer(controller.getPlayingField().getCell(i, j).getValue()));
				field[i][j].put("isrevealed", new Boolean(controller.getPlayingField().getCell(i, j).isRevealed()));
			}
		}

		Map<String, Object> json = new HashMap<String, Object>();
		json.put("victory", new Boolean(controller.isVictory()));
		json.put("loose", new Boolean(controller.isGameOver()));
		json.put("field", field);

		return ok(Json.stringify(Json.toJson(json)));
	}
}
